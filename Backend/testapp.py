import librosa
import numpy as np
from keras.models import load_model
import timeit



audio, _ = librosa.load('C:\\Users\\91900\\Desktop\\Coding\\Techolution\\Backend\\doorStatus.wav', sr=16000)
# print(audio)



def extract_mfcc_features(audio, sr=16000, num_cepstral=13, frame_length=0.02, frame_stride=0.02,
                           num_filters=32, fft_length=320, preemphasis_coeff=0.98):
    # Apply pre-emphasis
    audio = np.append(audio[0], audio[1:] - preemphasis_coeff * audio[:-1])

    # Compute the short-time Fourier transform (STFT)
    hop_length = int(frame_stride * sr)
    n_fft = fft_length
    window = "hann"  # You can choose a different window function if needed
    stft_result = librosa.core.stft(audio, hop_length=hop_length, n_fft=n_fft, window=window)

    # Compute the mel spectrogram
    mel_spectrogram = librosa.feature.melspectrogram(S=np.abs(stft_result)**2, sr=sr, n_mels=num_filters)

    # Logarithm of the mel spectrogram
    log_mel_energy = np.log(mel_spectrogram + 1e-9)

    # Extract MFCC features using DCT
    mfcc_features = librosa.feature.mfcc(S=log_mel_energy, n_mfcc=num_cepstral)

    # Apply mean and variance normalization across time
    mfcc_features = librosa.util.normalize(mfcc_features, norm=2, axis=0, fill=True)

    return mfcc_features



features = []
mfcc_features = extract_mfcc_features(audio)
print(type(mfcc_features))
features.append(mfcc_features)
features=np.array(features)
model = load_model('LSTM_trial_model.h5')
predicttion = model.predict(features)
# print(len(mfcc_features))
# print()
print(predicttion)
print(np.argmax(predicttion))