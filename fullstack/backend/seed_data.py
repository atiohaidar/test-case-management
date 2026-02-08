
import json
import logging
import os
from database import DatabaseConnection
from ai_service import AIService

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def generate_cuid():
    """Consistent ID generation matching app.py logic"""
    import time
    import secrets
    timestamp = int(time.time() * 1000)
    random_part = secrets.token_hex(6)
    return f"tc_{timestamp}_{random_part}"

def seed_database():
    db = DatabaseConnection()
    ai_service = AIService()
    
    # Sample Test Cases
    sample_testcases = [
        {
            "name": "Successful Login with Valid Credentials",
            "description": "Verifies that a user can log in successfully with a valid email and password.",
            "type": "positive",
            "priority": "high",
            "steps": [
                {"step": "Navigate to the login page", "expectedResult": "Login form is displayed"},
                {"step": "Enter valid email and password", "expectedResult": "Fields are filled correctly"},
                {"step": "Click the login button", "expectedResult": "User is redirected to the dashboard"}
            ],
            "expectedResult": "User is successfully logged in and sees the dashboard.",
            "tags": ["auth", "login", "smoke-test"]
        },
        {
            "name": "Login Failure - Invalid Password",
            "description": "Verifies that login fails when an incorrect password is provided.",
            "type": "negative",
            "priority": "high",
            "steps": [
                {"step": "Navigate to login page", "expectedResult": "Login form is displayed"},
                {"step": "Enter valid email and incorrect password", "expectedResult": "Fields are filled"},
                {"step": "Click login button", "expectedResult": "Error message 'Invalid credentials' is shown"}
            ],
            "expectedResult": "Login fails and a clear error message is displayed.",
            "tags": ["auth", "login", "security"]
        },
        {
            "name": "Add Product to Shopping Cart",
            "description": "Verifies that a user can add a product to the cart from the product page.",
            "type": "positive",
            "priority": "medium",
            "steps": [
                {"step": "Search for a product named 'Smartphone'", "expectedResult": "Product appears in search results"},
                {"step": "Click on the product", "expectedResult": "Product detail page is displayed"},
                {"step": "Click 'Add to Cart'", "expectedResult": "Notification 'Product added to cart' is shown"}
            ],
            "expectedResult": "The cart count increases by 1 and product is visible in cart.",
            "tags": ["ecommerce", "cart", "navigation"]
        },
        {
            "name": "Password Reset - Expired Token",
            "description": "Verifies that password reset fails when using an expired link token.",
            "type": "negative",
            "priority": "medium",
            "steps": [
                {"step": "Click on an expired password reset link in email", "expectedResult": "Browser opens reset page"},
                {"step": "Enter new password and confirm", "expectedResult": "Fields are filled"},
                {"step": "Click 'Reset Password'", "expectedResult": "Error message 'Link has expired' is displayed"}
            ],
            "expectedResult": "Password is not reset and user is prompted to request a new link.",
            "tags": ["auth", "password-reset", "security"]
        }
    ]

    logger.info(f"Starting seeding process for {len(sample_testcases)} test cases...")

    for tc_data in sample_testcases:
        testcase_id = generate_cuid()
        
        # Combine text for embedding
        text_for_embedding = f"{tc_data['name']} {tc_data['description']} {' '.join(tc_data['tags'])}"
        
        logger.info(f"Generating embedding for: {tc_data['name']}")
        embedding = ai_service.generate_embedding_vector(text_for_embedding)
        
        db.create_testcase({
            'id': testcase_id,
            'name': tc_data['name'],
            'description': tc_data['description'],
            'type': tc_data['type'],
            'priority': tc_data['priority'],
            'steps': json.dumps(tc_data['steps']),
            'expectedResult': tc_data['expectedResult'],
            'tags': json.dumps(tc_data['tags']),
            'embedding': json.dumps(embedding),
            'aiGenerated': False
        })

    logger.info("Seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
