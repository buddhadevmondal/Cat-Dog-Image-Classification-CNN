# 🐱🐶 Cat or Dog — CNN Image Classifier

A deep learning web application that classifies uploaded images as **Cat** or **Dog** using a Convolutional Neural Network (CNN), PyTorch, and FastAPI.

## ✨ Features

- 🖼️ Upload, drag and drop images for classification.
- 🧠 CNN-based image prediction using a trained PyTorch model.
- 📊 Display prediction results and confidence scores.
- ⚡ FastAPI backend for image upload and inference.
- 🛡️ Error handling with FastAPI's `HTTPException`.
- 🎨 Modern dark-themed web interface.
- 🕘 Recent image preview section.

## 🛠️ Tech Stack

- Python
- PyTorch
- Torchvision
- FastAPI
- Uvicorn
- Pillow (PIL)
- HTML, CSS and JavaScript

## 📁 Project Structure

```text
Cat-Dog-Image-Classification-CNN/
├── CatsAndDogsClassification_fixed.ipynb
├── cats_dogs_cnn.pth
├── main.py
├── model.py
├── requirements.txt
├── README.md
└── static/
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/Cat-Dog-Image-Classification-CNN.git
cd Cat-Dog-Image-Classification-CNN
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the application

```bash
python -m uvicorn main:app --reload
```

### 4. Open the application

Visit:

- **Web application:** http://127.0.0.1:8000
- **API documentation:** http://127.0.0.1:8000/docs

The web interface and API routes depend on the implementation in `main.py` and the `static/` directory.

## 🔍 How It Works

1. The user uploads a cat or dog image.
2. FastAPI receives the uploaded image.
3. Pillow and Torchvision preprocess the image for the CNN.
4. The trained PyTorch model predicts the class.
5. The application displays the predicted label and confidence information.
6. Invalid image uploads and other expected errors are handled using `HTTPException`.

## 🧠 Model Information

- **Model type:** Convolutional Neural Network (CNN)
- **Framework:** PyTorch
- **Input size:** 128 × 128 pixels, if configured in the model preprocessing pipeline
- **Saved model:** `cats_dogs_cnn.pth`
- **Task:** Binary image classification

## 📊 Performance

Add verified test-set accuracy and evaluation metrics after testing the saved model on unseen images. Displayed prediction confidence should not be treated as guaranteed real-world accuracy.

## 🚀 Future Improvements

- Fix and validate class probability calculations.
- Improve prediction reliability on unseen images.
- Add model evaluation metrics and a confusion matrix.
- Deploy the application online.
- Add automated tests for API endpoints and invalid uploads.

## 👨‍💻 Author

**Your Name**

GitHub: https://github.com/buddhadevmondal

## 📄 License

Add an appropriate license if you want to permit others to reuse, modify, or distribute this project.
# Cat-Dog-Image-Classification-CNN
CNN-based Cat and Dog Image Classification using PyTorch and deep learning. Includes model training, evaluation, a saved trained model, and a prediction interface.
