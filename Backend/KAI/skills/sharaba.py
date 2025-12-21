# This script is designed to be executed as a standalone module by the PAI skill runner (`pai/pai.py`).
# It follows the existing architectural pattern of other skills, which are invoked directly
# rather than being instantiated as classes.

import cv2
import os
import tempfile

def analyze_emotion(image_path):
    """
    Placeholder for Hume AI emotion analysis.
    In the future, this function will use the Hume AI SDK to analyze the image.
    """
    # Mock analysis result
    mock_emotions = {
        "Joy": 0.7,
        "Sadness": 0.1,
        "Surprise": 0.2,
    }

    analysis_text = "Detected emotions:\n"
    for emotion, score in mock_emotions.items():
        analysis_text += f"- {emotion}: {score*100:.1f}%\n"

    return analysis_text

def main():
    """
    Captures an image from the webcam, saves it, and analyzes it for emotions.
    """
    # Initialize the webcam
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return

    # Capture a single frame
    ret, frame = cap.read()

    # Release the webcam
    cap.release()

    if not ret:
        print("Error: Could not read frame from webcam.")
        return

    # Create a temporary file in a platform-agnostic way
    temp_image_path = ""
    try:
        # Create a named temporary file, get its path, and then close it
        # so that cv2.imwrite can open and write to it.
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_f:
            temp_image_path = temp_f.name

        cv2.imwrite(temp_image_path, frame)
        print(f"Image captured and saved to {temp_image_path}")

        # Analyze the image for emotions
        emotion_analysis = analyze_emotion(temp_image_path)

        print("\n--- Sharaba Kavacham Analysis ---")
        print(emotion_analysis)
        print("---------------------------------")

    finally:
        # Clean up the temporary file
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
            print(f"Temporary file {temp_image_path} removed.")


if __name__ == "__main__":
    main()
