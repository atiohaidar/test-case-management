"""
Fullstack Flask Backend for Test Case Management System
A unified Python backend with Flask, integrating AI services for test case generation and semantic search.
"""

import os
import json
import uuid
import logging
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import local modules
from database import DatabaseConnection
from ai_service import AIService
from gemini_service import GeminiService

# Setup logging
log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
logging.basicConfig(level=getattr(logging, log_level))
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__, 
            template_folder='../frontend/templates',
            static_folder='../frontend/static')
CORS(app)

# Initialize services
db = DatabaseConnection()
ai_service = AIService()
gemini_service = GeminiService()


def generate_cuid():
    """Generate a sortable unique identifier (timestamp + random hex)"""
    import time
    import secrets
    timestamp = int(time.time() * 1000)
    random_part = secrets.token_hex(6)
    return f"tc_{timestamp}_{random_part}"


def serialize_testcase(testcase):
    """Convert database testcase to JSON serializable dict"""
    if not testcase:
        return None
    
    result = {
        'id': testcase['id'],
        'name': testcase['name'],
        'description': testcase['description'],
        'type': testcase['type'],
        'priority': testcase['priority'],
        'steps': json.loads(testcase['steps']) if isinstance(testcase['steps'], str) else testcase['steps'],
        'expectedResult': testcase['expectedResult'],
        'tags': json.loads(testcase['tags']) if isinstance(testcase['tags'], str) else testcase['tags'],
        'aiGenerated': bool(testcase.get('aiGenerated', False)),
        'originalPrompt': testcase.get('originalPrompt'),
        'aiConfidence': testcase.get('aiConfidence'),
        'aiSuggestions': testcase.get('aiSuggestions'),
        'aiGenerationMethod': testcase.get('aiGenerationMethod'),
        'tokenUsage': json.loads(testcase['tokenUsage']) if testcase.get('tokenUsage') and isinstance(testcase['tokenUsage'], str) else testcase.get('tokenUsage'),
        'createdAt': testcase.get('createdAt'),  # SQLite returns as string already
        'updatedAt': testcase.get('updatedAt'),  # SQLite returns as string already
    }
    return result


# ==================== FRONTEND ROUTES ====================

@app.route('/')
def index():
    """Serve the main list page"""
    return render_template('list.html')


@app.route('/create')
def create_choice():
    """Serve the create choice page"""
    return render_template('create.html')


@app.route('/create/manual')
def create_manual():
    """Serve the manual create page"""
    return render_template('create-manual.html')


@app.route('/create/bulk')
def create_bulk():
    """Serve the bulk create page"""
    return render_template('create-bulk.html')


@app.route('/create/ai')
def create_ai():
    """Serve the AI generate page"""
    return render_template('create-ai.html')


@app.route('/search')
def search_page():
    """Serve the semantic search page"""
    return render_template('search.html')


@app.route('/detail/<testcase_id>')
def detail_page(testcase_id):
    """Serve the detail page"""
    return render_template('detail.html', testcase_id=testcase_id)


@app.route('/edit/<testcase_id>')
def edit_page(testcase_id):
    """Serve the edit page"""
    return render_template('edit.html', testcase_id=testcase_id)


# ==================== API ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Fullstack Flask Backend'})


# ==================== TEST CASE CRUD ====================

@app.route('/api/testcases', methods=['GET'])
def get_all_testcases():
    """Get all test cases with reference counts"""
    try:
        testcases = db.get_all_testcases()
        result = []
        for tc in testcases:
            serialized = serialize_testcase(tc)
            # Add reference counts
            counts = db.get_reference_counts(tc['id'])
            serialized['referencesCount'] = counts['references_count']
            serialized['referencedByCount'] = counts['referenced_by_count']
            serialized['ragReferencesCount'] = counts['rag_references_count']
            serialized['manualReferencesCount'] = counts['manual_references_count']
            serialized['derivedFromCount'] = counts['derived_from_count']
            result.append(serialized)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error getting testcases: {e}")
        return jsonify({'error': str(e)}), 500


@app.errorhandler(Exception)
def handle_exception(e):
    """Global error handler for all unhandled exceptions"""
    logger.error(f"Unhandled exception: {e}", exc_info=True)
    return jsonify({
        'error': 'An internal server error occurred',
        'message': str(e) if app.debug else 'Please contact administrator'
    }), 500


@app.route('/api/testcases/<id>', methods=['GET'])
def get_testcase(id):
    """Get a single test case by ID"""
    try:
        testcase = db.get_testcase_by_id(id)
        if not testcase:
            return jsonify({'error': 'Test case not found'}), 404
        return jsonify(serialize_testcase(testcase))
    except Exception as e:
        return handle_exception(e)


@app.route('/api/testcases/<id>/full', methods=['GET'])
def get_testcase_full(id):
    """Get a test case with full reference information"""
    try:
        testcase = db.get_testcase_by_id(id)
        if not testcase:
            return jsonify({'error': 'Test case not found'}), 404
        
        serialized = serialize_testcase(testcase)
        
        # Get references
        references = db.get_references(id)
        serialized['references'] = references
        
        # Get referenced by
        referenced_by = db.get_referenced_by(id)
        serialized['referencedBy'] = referenced_by
        
        # Get derived test cases
        derived = db.get_derived_testcases(id)
        serialized['derivedTestCases'] = derived
        
        # Get counts
        counts = db.get_reference_counts(id)
        serialized['referencesCount'] = counts['references_count']
        serialized['derivedCount'] = counts['referenced_by_count']
        
        return jsonify(serialized)
    except Exception as e:
        logger.error(f"Error getting full testcase: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/testcases', methods=['POST'])
def create_testcase():
    """Create a new test case"""
    try:
        data = request.get_json()
        
        # Generate embedding
        text_for_embedding = f"{data.get('name', '')} {data.get('description', '')} {' '.join(data.get('tags', []))}"
        embedding = ai_service.generate_embedding_vector(text_for_embedding)
        
        # Create test case
        testcase_id = generate_cuid()
        testcase = db.create_testcase({
            'id': testcase_id,
            'name': data['name'],
            'description': data['description'],
            'type': data.get('type', 'positive'),
            'priority': data.get('priority', 'medium'),
            'steps': json.dumps(data.get('steps', [])),
            'expectedResult': data.get('expectedResult', ''),
            'tags': json.dumps(data.get('tags', [])),
            'embedding': json.dumps(embedding),
            'aiGenerated': data.get('aiGenerated', False),
            'originalPrompt': data.get('originalPrompt'),
            'aiConfidence': data.get('aiConfidence'),
            'aiSuggestions': data.get('aiSuggestions'),
            'aiGenerationMethod': data.get('aiGenerationMethod'),
            'tokenUsage': json.dumps(data.get('tokenUsage')) if data.get('tokenUsage') else None,
        })
        
        # Handle references
        if data.get('referenceTo') and data.get('referenceType'):
            db.create_reference(testcase_id, data['referenceTo'], data['referenceType'])
        
        # Handle RAG references
        if data.get('ragReferences'):
            for ref in data['ragReferences']:
                db.create_reference(testcase_id, ref['testCaseId'], 'rag_retrieval', ref.get('similarity'))
        
        return jsonify(serialize_testcase(testcase)), 201
    except Exception as e:
        logger.error(f"Error creating testcase: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/testcases/bulk', methods=['POST'])
def bulk_create_testcases():
    """Bulk create multiple test cases"""
    try:
        data = request.get_json()
        testcases_data = data.get('testCases', [])
        
        if not testcases_data:
            return jsonify({'error': 'No test cases provided'}), 400
        
        # Prepare test cases with IDs and embeddings
        prepared_testcases = []
        for tc_data in testcases_data:
            testcase_id = generate_cuid()
            
            # Generate embedding
            text_for_embedding = f"{tc_data.get('name', '')} {tc_data.get('description', '')} {' '.join(tc_data.get('tags', []))}"
            embedding = ai_service.generate_embedding_vector(text_for_embedding)
            
            prepared_testcases.append({
                'id': testcase_id,
                'name': tc_data['name'],
                'description': tc_data['description'],
                'type': tc_data.get('type', 'positive'),
                'priority': tc_data.get('priority', 'medium'),
                'steps': json.dumps(tc_data.get('steps', [])),
                'expectedResult': tc_data.get('expectedResult', ''),
                'tags': json.dumps(tc_data.get('tags', [])),
                'embedding': json.dumps(embedding),
                'aiGenerated': tc_data.get('aiGenerated', False),
                'originalPrompt': tc_data.get('originalPrompt'),
                'aiConfidence': tc_data.get('aiConfidence'),
                'aiSuggestions': tc_data.get('aiSuggestions'),
                'aiGenerationMethod': tc_data.get('aiGenerationMethod'),
                'tokenUsage': json.dumps(tc_data.get('tokenUsage')) if tc_data.get('tokenUsage') else None,
            })
        
        # Bulk create
        results = db.bulk_create_testcases(prepared_testcases)
        
        # Calculate statistics
        success_count = sum(1 for r in results if r['success'])
        failure_count = sum(1 for r in results if not r['success'])
        
        return jsonify({
            'results': results,
            'total': len(results),
            'successCount': success_count,
            'failureCount': failure_count
        }), 201
    except Exception as e:
        logger.error(f"Error bulk creating testcases: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/testcases/<id>', methods=['PATCH'])
def update_testcase(id):
    """Update a test case"""
    try:
        data = request.get_json()
        
        # Check if exists
        existing = db.get_testcase_by_id(id)
        if not existing:
            return jsonify({'error': 'Test case not found'}), 404
        
        # Generate new embedding if content changed
        text_for_embedding = f"{data.get('name', existing['name'])} {data.get('description', existing['description'])} {' '.join(data.get('tags', json.loads(existing['tags']) if isinstance(existing['tags'], str) else existing['tags']))}"
        embedding = ai_service.generate_embedding_vector(text_for_embedding)
        
        # Update test case
        testcase = db.update_testcase(id, {
            'name': data.get('name', existing['name']),
            'description': data.get('description', existing['description']),
            'type': data.get('type', existing['type']),
            'priority': data.get('priority', existing['priority']),
            'steps': json.dumps(data.get('steps')) if data.get('steps') else existing['steps'],
            'expectedResult': data.get('expectedResult', existing['expectedResult']),
            'tags': json.dumps(data.get('tags')) if data.get('tags') else existing['tags'],
            'embedding': json.dumps(embedding),
        })
        
        return jsonify(serialize_testcase(testcase))
    except Exception as e:
        logger.error(f"Error updating testcase: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/testcases/<id>', methods=['DELETE'])
def delete_testcase(id):
    """Delete a test case"""
    try:
        existing = db.get_testcase_by_id(id)
        if not existing:
            return jsonify({'error': 'Test case not found'}), 404
        
        db.delete_testcase(id)
        return '', 204
    except Exception as e:
        logger.error(f"Error deleting testcase: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== SEARCH ====================

@app.route('/api/testcases/search', methods=['GET'])
def search_testcases():
    """Semantic search for test cases"""
    try:
        query = request.args.get('query', '')
        min_similarity = float(request.args.get('minSimilarity', 0.1))
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify([])
        
        results = ai_service.semantic_search(query, min_similarity, limit)
        return jsonify(results)
    except Exception as e:
        logger.error(f"Error searching: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== AI GENERATION ====================

@app.route('/api/testcases/generate-with-ai', methods=['POST'])
def generate_with_ai():
    """Generate a test case using AI (preview only)"""
    try:
        data = request.get_json()
        result = gemini_service.generate_test_case(
            prompt=data['prompt'],
            context=data.get('context'),
            preferred_type=data.get('preferredType'),
            preferred_priority=data.get('preferredPriority'),
            use_rag=data.get('useRAG', True),
            rag_similarity_threshold=data.get('ragSimilarityThreshold', 0.7),
            max_rag_references=data.get('maxRAGReferences', 3)
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error generating with AI: {e}")
        return jsonify({'error': str(e)}), 503


@app.route('/api/testcases/generate-and-save-with-ai', methods=['POST'])
def generate_and_save_with_ai():
    """Generate a test case using AI and save it to the database"""
    try:
        data = request.get_json()
        
        # Generate test case with AI
        ai_result = gemini_service.generate_test_case(
            prompt=data['prompt'],
            context=data.get('context'),
            preferred_type=data.get('preferredType'),
            preferred_priority=data.get('preferredPriority'),
            use_rag=data.get('useRAG', True),
            rag_similarity_threshold=data.get('ragSimilarityThreshold', 0.7),
            max_rag_references=data.get('maxRAGReferences', 3)
        )
        
        # Generate embedding
        text_for_embedding = f"{ai_result['name']} {ai_result['description']} {' '.join(ai_result.get('tags', []))}"
        embedding = ai_service.generate_embedding_vector(text_for_embedding)
        
        # Create test case
        testcase_id = generate_cuid()
        testcase = db.create_testcase({
            'id': testcase_id,
            'name': ai_result['name'],
            'description': ai_result['description'],
            'type': ai_result.get('type', 'positive'),
            'priority': ai_result.get('priority', 'medium'),
            'steps': json.dumps(ai_result.get('steps', [])),
            'expectedResult': ai_result.get('expectedResult', ''),
            'tags': json.dumps(ai_result.get('tags', [])),
            'embedding': json.dumps(embedding),
            'aiGenerated': True,
            'originalPrompt': data['prompt'],
            'aiConfidence': ai_result.get('confidence'),
            'aiSuggestions': ai_result.get('aiSuggestions'),
            'aiGenerationMethod': ai_result.get('aiGenerationMethod', 'pure_ai'),
            'tokenUsage': json.dumps(ai_result.get('tokenUsage')) if ai_result.get('tokenUsage') else None,
        })
        
        # Handle RAG references
        if ai_result.get('ragReferences'):
            for ref in ai_result['ragReferences']:
                db.create_reference(testcase_id, ref['testCaseId'], 'rag_retrieval', ref.get('similarity'))
        
        result = serialize_testcase(testcase)
        result['ragReferences'] = ai_result.get('ragReferences', [])
        
        return jsonify(result), 201
    except Exception as e:
        logger.error(f"Error generating and saving with AI: {e}")
        return jsonify({'error': str(e)}), 503


# ==================== DERIVATION ====================

@app.route('/api/testcases/derive/<reference_id>', methods=['POST'])
def derive_testcase(reference_id):
    """Create a new test case derived from an existing one"""
    try:
        # Check if reference exists
        reference = db.get_testcase_by_id(reference_id)
        if not reference:
            return jsonify({'error': 'Reference test case not found'}), 404
        
        data = request.get_json()
        
        # Generate embedding
        text_for_embedding = f"{data.get('name', '')} {data.get('description', '')} {' '.join(data.get('tags', []))}"
        embedding = ai_service.generate_embedding_vector(text_for_embedding)
        
        # Create test case
        testcase_id = generate_cuid()
        testcase = db.create_testcase({
            'id': testcase_id,
            'name': data['name'],
            'description': data['description'],
            'type': data.get('type', 'positive'),
            'priority': data.get('priority', 'medium'),
            'steps': json.dumps(data.get('steps', [])),
            'expectedResult': data.get('expectedResult', ''),
            'tags': json.dumps(data.get('tags', [])),
            'embedding': json.dumps(embedding),
            'aiGenerated': data.get('aiGenerated', False),
            'originalPrompt': data.get('originalPrompt'),
            'aiConfidence': data.get('aiConfidence'),
            'aiSuggestions': data.get('aiSuggestions'),
            'aiGenerationMethod': data.get('aiGenerationMethod'),
            'tokenUsage': json.dumps(data.get('tokenUsage')) if data.get('tokenUsage') else None,
        })
        
        # Create reference to parent
        db.create_reference(testcase_id, reference_id, 'semantic_search')
        
        return jsonify(serialize_testcase(testcase)), 201
    except Exception as e:
        logger.error(f"Error deriving testcase: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== REFERENCES ====================

@app.route('/api/testcases/<source_id>/reference/<target_id>', methods=['POST'])
def add_reference(source_id, target_id):
    """Add a manual reference between two test cases"""
    try:
        source = db.get_testcase_by_id(source_id)
        target = db.get_testcase_by_id(target_id)
        
        if not source:
            return jsonify({'error': 'Source test case not found'}), 404
        if not target:
            return jsonify({'error': 'Target test case not found'}), 404
        
        db.create_reference(source_id, target_id, 'manual')
        return jsonify({'message': 'Reference added successfully'}), 201
    except Exception as e:
        if 'Duplicate entry' in str(e) or 'already exists' in str(e).lower():
            return jsonify({'error': 'Reference already exists'}), 409
        logger.error(f"Error adding reference: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/testcases/reference/<reference_id>', methods=['DELETE'])
def remove_reference(reference_id):
    """Remove a reference"""
    try:
        db.delete_reference(reference_id)
        return jsonify({'message': 'Reference removed successfully'})
    except Exception as e:
        logger.error(f"Error removing reference: {e}")
        return jsonify({'error': str(e)}), 500


# ==================== STATS ====================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get AI service statistics"""
    try:
        stats = ai_service.get_statistics()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', '5000'))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
