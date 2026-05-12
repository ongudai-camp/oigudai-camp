"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createActivityAction } from "@/app/actions/activity";
import ImageUploader from "./ImageUploader";

enum Step {
  ACTIVITY_INFO = 1,
  DETAILS = 2,
  GALLERY = 3,
  REVIEW = 4,
}

export default function ActivityWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(Step.ACTIVITY_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Activity info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState("excursion");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Details
  const [included, setIncluded] = useState("");
  const [requirements, setRequirements] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("address", address);
      formData.append("price", price);
      if (salePrice) formData.append("salePrice", salePrice);
      if (duration) formData.append("duration", duration);
      formData.append("category", category);
      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);
      formData.append("included", included);
      formData.append("requirements", requirements);
      formData.append("difficulty", difficulty);
      if (images.length > 0) {
        formData.append("featuredImage", images[0]);
        formData.append("gallery", JSON.stringify(images));
      }

      const result = await createActivityAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/activities");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.ACTIVITY_INFO:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Информация об активности</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название активности *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Например: Рафтинг на Катуни"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="excursion">Экскурсия</option>
                <option value="rafting">Рафтинг</option>
                <option value="hiking">Пеший поход</option>
                <option value="horseback">Конная прогулка</option>
                <option value="fishing">Рыбалка</option>
                <option value="skiing">Лыжи/Сноуборд</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Описание активности..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Локация/Место проведения
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="с. Онгудай, р. Катунь"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена со скидкой (₽)
                </label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="1500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сложность
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="easy">Легкая</option>
                  <option value="medium">Средняя</option>
                  <option value="hard">Сложная</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Длительность
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="3 часа"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Широта
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="50.123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Долгота
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="85.123"
                />
              </div>
            </div>
          </div>
        );

      case Step.DETAILS:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Детали активности</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Что включено
              </label>
              <textarea
                value={included}
                onChange={(e) => setIncluded(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Инвентарь, инструктор, трансфер..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Требования/Что взять с собой
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Удобная обувь, купальник, солнцезащитный крем..."
              />
            </div>
          </div>
        );

      case Step.GALLERY:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Галерея изображений</h2>
            <p className="text-gray-600">
              Загрузите изображения активности. Первое изображение будет главным.
            </p>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        );

      case Step.REVIEW:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Проверка и сохранение</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Информация об активности</h3>
                <p className="text-gray-600">Название: {title}</p>
                <p className="text-gray-600">Категория: {category}</p>
                <p className="text-gray-600">Локация: {address}</p>
                <p className="text-gray-600">Цена: {price} ₽</p>
                {duration && <p className="text-gray-600">Длительность: {duration}</p>}
                {images.length > 0 && (
                  <p className="text-gray-600">Изображения: {images.length} шт.</p>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  currentStep >= step
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Инфо</span>
          <span className="text-xs text-gray-500">Детали</span>
          <span className="text-xs text-gray-500">Фото</span>
          <span className="text-xs text-gray-500">Готово</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">{renderStep()}</div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentStep(currentStep - 1)}
          disabled={currentStep === Step.ACTIVITY_INFO}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Назад
        </button>

        {currentStep < Step.REVIEW ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
          >
            Далее
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Сохранение…" : "Сохранить активность"}
          </button>
        )}
      </div>
    </div>
  );
}
