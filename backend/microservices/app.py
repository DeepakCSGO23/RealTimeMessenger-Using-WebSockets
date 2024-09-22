from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.json
    # Ensure that 'message' is a string :)
    message = data.get('message', '')
    if not isinstance(message, str):
        return jsonify({'error': 'Invalid input, expected a string'}), 400

    # Perform sentiment analysis
    analysis = TextBlob(message)
    sentiment = analysis.sentiment.polarity

    # Return the sentiment result
    return jsonify({'sentiment': sentiment})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "server is up and running"}), 200

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
