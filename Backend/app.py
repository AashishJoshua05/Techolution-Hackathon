from flask import Flask
from flask_socketio import SocketIO
import librosa
import numpy as np
from keras.models import load_model


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

TARGET_SHAPE = (13, 51)
model = load_model('lstm_trial_model.h5')

def extract_mfcc_features(audio, sr, num_cepstral=13, frame_length=0.02, frame_stride=0.02,
                          num_filters=32, fft_length=320, preemphasis_coeff=0.98):
    # Apply pre-emphasis
    audio = np.append(audio[0], audio[1:] - preemphasis_coeff * audio[:-1])

    # Compute the mel spectrogram
    mel_spectrogram = librosa.feature.melspectrogram(y=audio, sr=sr, n_mels=num_filters, n_fft=fft_length,
                                                     hop_length=int(frame_stride * sr), window="hann")

    # Logarithm of the mel spectrogram
    log_mel_energy = np.log(mel_spectrogram + 1e-9)

    # Extract MFCC features using DCT
    mfcc_features = librosa.feature.mfcc(S=log_mel_energy, n_mfcc=num_cepstral)

    # Adjust shape to target shape
    mfcc_features = mfcc_features[:, :TARGET_SHAPE[1]] if mfcc_features.shape[1] > TARGET_SHAPE[1] \
        else np.pad(mfcc_features, pad_width=((0, 0), (0, TARGET_SHAPE[1] - mfcc_features.shape[1])),
                   mode='constant', constant_values=0.0)
    mfcc_features = mfcc_features[:TARGET_SHAPE[0], :] if mfcc_features.shape[0] > TARGET_SHAPE[0] \
        else np.pad(mfcc_features, pad_width=((0, TARGET_SHAPE[0] - mfcc_features.shape[0]), (0, 0)),
                   mode='constant', constant_values=0.0)

    return np.array([mfcc_features])


@socketio.on('audioData')
def handle_audio(audio_blob):
    try:
        with open('audio_received.wav', 'wb') as f:
            f.write(audio_blob)

        audio, sr = librosa.load('audio_received.wav', sr=None)
        mfcc_features = extract_mfcc_features(audio, sr)
        prediction = model.predict(mfcc_features)
        print(prediction)
        confidence = np.max(prediction)
        if confidence < 0.99:
            response = 3
        else:
            response = str(np.argmax(prediction))

    except Exception as e:
        response = "Error processing audio: " + str(e)

    socketio.emit('processedAudio', response)

if __name__ == '__main__':
    socketio.run(app)
