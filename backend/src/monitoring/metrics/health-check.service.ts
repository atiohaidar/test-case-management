import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class HealthCheckService {
    constructor(private prisma: PrismaService) { }

    async getHealthStatus() {
        const checks = await Promise.allSettled([
            this.checkDatabase(),
            this.checkAiService(),
            this.checkMemoryUsage(),
            this.checkDiskSpace()
        ]);

        const results = checks.map((check, index) => {
            const checkNames = ['database', 'ai_service', 'memory', 'disk'];
            return {
                name: checkNames[index],
                status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
                details: check.status === 'fulfilled' ? check.value : check.reason?.message || 'Unknown error',
                timestamp: new Date().toISOString()
            };
        });

        const overallStatus = results.every(r => r.status === 'healthy') ? 'healthy' : 'unhealthy';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            checks: results
        };
    }

    private async checkDatabase(): Promise<{ status: string; responseTime: number }> {
        const startTime = Date.now();
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            const responseTime = Date.now() - startTime;
            return { status: 'Database connection successful', responseTime };
        } catch (error) {
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    private async checkAiService(): Promise<{ status: string; responseTime: number }> {
        const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
        const startTime = Date.now();

        try {
            const response = await axios.get(`${aiServiceUrl}/health`, {
                timeout: 5000 // 5 second timeout
            });

            if (response.status === 200) {
                const responseTime = Date.now() - startTime;
                return { status: 'AI service is healthy', responseTime };
            } else {
                throw new Error(`AI service returned status ${response.status}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                throw new Error('AI service is not running');
            }
            throw new Error(`AI service health check failed: ${error.message}`);
        }
    }

    private async checkMemoryUsage(): Promise<{ usage: number; limit: number; percentage: number }> {
        const memUsage = process.memoryUsage();
        const usageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const limitMB = Math.round(memUsage.heapTotal / 1024 / 1024);
        const percentage = Math.round((usageMB / limitMB) * 100);

        // Consider unhealthy if memory usage > 90%
        if (percentage > 90) {
            throw new Error(`High memory usage: ${percentage}% (${usageMB}MB/${limitMB}MB)`);
        }

        return { usage: usageMB, limit: limitMB, percentage };
    }

    private async checkDiskSpace(): Promise<{ available: number; total: number; percentage: number }> {
        // For Linux systems, we can use a simple check
        // In production, you might want to use a more sophisticated disk space monitoring
        try {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);

            const { stdout } = await execAsync('df / | tail -1');
            const parts = stdout.trim().split(/\s+/);
            const availableKB = parseInt(parts[3]);
            const totalKB = parseInt(parts[1]);
            const availableGB = Math.round(availableKB / 1024 / 1024);
            const totalGB = Math.round(totalKB / 1024 / 1024);
            const percentage = Math.round((availableGB / totalGB) * 100);

            // Consider unhealthy if available space < 10%
            if (percentage < 10) {
                throw new Error(`Low disk space: ${percentage}% available (${availableGB}GB/${totalGB}GB)`);
            }

            return { available: availableGB, total: totalGB, percentage };
        } catch (error) {
            // If disk check fails, don't fail the entire health check
            return { available: -1, total: -1, percentage: -1 };
        }
    }

    async getDetailedHealth() {
        const basicHealth = await this.getHealthStatus();

        // Add more detailed metrics
        const detailedChecks = await Promise.allSettled([
            this.getSystemInfo(),
            this.getDatabaseStats(),
            this.getCacheStats()
        ]);

        return {
            ...basicHealth,
            details: detailedChecks.map((check, index) => {
                const checkNames = ['system_info', 'database_stats', 'cache_stats'];
                return {
                    name: checkNames[index],
                    data: check.status === 'fulfilled' ? check.value : null,
                    error: check.status === 'rejected' ? check.reason?.message : null
                };
            })
        };
    }

    private async getSystemInfo() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();

        return {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version,
            memory: {
                used: Math.round(memUsage.heapUsed / 1024 / 1024),
                total: Math.round(memUsage.heapTotal / 1024 / 1024),
                external: Math.round(memUsage.external / 1024 / 1024),
                rss: Math.round(memUsage.rss / 1024 / 1024)
            },
            cpu: {
                user: cpuUsage.user,
                system: cpuUsage.system
            },
            uptime: process.uptime()
        };
    }

    private async getDatabaseStats() {
        try {
            const result = await this.prisma.$queryRaw`
        SELECT
          COUNT(*) as total_testcases,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as testcases_last_24h,
          COUNT(CASE WHEN updated_at > NOW() - INTERVAL '1 hour' THEN 1 END) as testcases_updated_last_hour
        FROM testcase
      `;

            return result[0];
        } catch (error) {
            return { error: 'Failed to get database stats' };
        }
    }

    private async getCacheStats() {
        // Placeholder for cache statistics
        // In a real implementation, you would get stats from Redis or other cache providers
        return {
            status: 'Cache stats not implemented yet',
            note: 'Implement when Redis caching is added'
        };
    }
}