import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

interface CameraModalProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      setError(null);
      
      // Останавливаем предыдущий поток
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Ошибка доступа к камере:', err);
      setError('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Устанавливаем размеры canvas равными размерам видео
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Рисуем текущий кадр видео на canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Получаем изображение в формате data URL
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    
    // Передаем изображение в родительский компонент
    onCapture(imageDataUrl);
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Видео поток */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Скрытый canvas для захвата фото */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Ошибка */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center text-white p-4">
              <Camera className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-lg mb-2">Ошибка камеры</p>
              <p className="text-sm text-gray-300 mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="flex items-center justify-between">
            {/* Кнопка закрытия */}
            <button
              onClick={onClose}
              className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Кнопка съемки */}
            <button
              onClick={capturePhoto}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <Camera className="w-8 h-8 text-black" />
            </button>

            {/* Кнопка переключения камеры */}
            <button
              onClick={switchCamera}
              className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Инструкция */}
        <div className="absolute top-4 left-4 right-4 text-center">
          <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-3 py-2">
            Наведите камеру на товар и нажмите кнопку съемки
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
