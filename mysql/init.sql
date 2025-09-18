-- Initialize the database
CREATE DATABASE IF NOT EXISTS testcase_management;
USE testcase_management;

-- Grant permissions
GRANT ALL PRIVILEGES ON testcase_management.* TO 'root'@'%';
FLUSH PRIVILEGES;