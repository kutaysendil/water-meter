"use client";

import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import Tesseract from "tesseract.js";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const WaterMeterReader: React.FC = () => {
  const [ocrResult, setOcrResult] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const preprocessImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Unable to get canvas context"));
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg > 128 ? 255 : 0;
          }

          ctx.putImageData(imageData, 0, 0);
          resolve(canvas.toDataURL("image/jpeg"));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError("");
    setOcrResult("");

    try {
      const preprocessedImage = await preprocessImage(file);
      setImagePreview(preprocessedImage);

      const result = await Tesseract.recognize(preprocessedImage, "eng", {
        logger: (m) => console.log(m),
      });

      const numbers = result.data.text.match(/\d+/g);
      if (numbers) {
        setOcrResult(numbers.join(""));
      } else {
        throw new Error("Sayı bulunamadı");
      }
    } catch (error) {
      setError(
        "Görüntü işleme sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const resetReader = () => {
    setOcrResult("");
    setError("");
    setImagePreview(null);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="mb-4">
        <label
          htmlFor="imageUpload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Su sayacı fotoğrafını yükleyin
        </label>
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={handleImageUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {imagePreview && (
        <div className="mb-4">
          <img
            src={imagePreview}
            alt="Yüklenen fotoğraf"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center justify-center mb-4">
          <RefreshCw className="animate-spin mr-2" />
          <span>İşleniyor...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {ocrResult && (
        <Alert className="mb-4">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Sayaç Değeri</AlertTitle>
          <AlertDescription>{ocrResult}</AlertDescription>
        </Alert>
      )}

      <button
        onClick={resetReader}
        className="px-4 py-2 bg-gray-500 text-white rounded flex items-center justify-center w-full"
        disabled={isProcessing}
      >
        <RefreshCw className="mr-2" />
        Sıfırla
      </button>

      <p className="text-sm text-gray-600 mt-4">
        Lütfen su sayacınızın net bir fotoğrafını yükleyin. Rakamların açıkça
        görülebilir olduğundan emin olun. En iyi sonuç için iyi aydınlatma
        koşulları altında çekilmiş bir fotoğraf kullanın.
      </p>
    </div>
  );
};

export default WaterMeterReader;
