"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTourAction } from "@/app/actions/tour";
import ImageUploader from "./ImageUploader";
import LocationPicker from "@/components/common/LocationPicker";

enum Step {
  TOUR_INFO = 1,
  DETAILS = 2,
  GALLERY = 3,
  REVIEW = 4,
}

export default function TourWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(Step.TOUR_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tour info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [duration, setDuration] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Details
  const [included, setIncluded] = useState("");
  const [notIncluded, setNotIncluded] = useState("");
  const [images, setImages] = useState<string[]>([]);
  interface ItineraryDay {
    day: number;
    title: string;
    description: string;
  }

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { day: 1, title: "", description: "" },
  ]);

  const addDay = () => {
    setItinerary([...itinerary, { day: itinerary.length + 1, title: "", description: "" }]);
  };

  const updateDay = (index: number, field: "title" | "description", value: string) => {
    const newItinerary = [...itinerary];
    newItinerary[index][field] = value;
    setItinerary(newItinerary);
  };

  const removeDay = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

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
      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);
      formData.append("included", included);
      formData.append("notIncluded", notIncluded);
      formData.append("itinerary", JSON.stringify(itinerary));
      if (images.length > 0) {
        formData.append("featuredImage", images[0]);
        formData.append("gallery", JSON.stringify(images));
      }

      const result = await createTourAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/tours");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.TOUR_INFO:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#5000FF]">Информация о туре</h2>

            <div>
              <label htmlFor="tour-title" className="block text-sm font-medium text-gray-700 mb-2">
                Название тура *
              </label>
              <input
                id="tour-title"
                name="title"
                type="text"
                required
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                placeholder="Например: Экскурсия по Онгудаю"
              />
            </div>

            <div>
              <label htmlFor="tour-description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="tour-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                placeholder="Описание тура..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Локация/Маршрут
              </label>
              <LocationPicker
                address={address}
                latitude={latitude ? parseFloat(latitude) : null}
                longitude={longitude ? parseFloat(longitude) : null}
                onChange={(data) => {
                  setAddress(data.address);
                  setLatitude(data.latitude?.toString() || "");
                  setLongitude(data.longitude?.toString() || "");
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tour-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Цена (₽) *
                </label>
                <input
                  id="tour-price"
                  name="price"
                  type="number"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                  placeholder="5000"
                />
              </div>

              <div>
                <label htmlFor="tour-salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Цена со скидкой (₽)
                </label>
                <input
                  id="tour-salePrice"
                  name="salePrice"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                  placeholder="4000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="tour-duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Длительность (дни)
                </label>
                <input
                  id="tour-duration"
                  name="duration"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                  placeholder="3"
                />
              </div>


            </div>
          </div>
        );

      case Step.DETAILS:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#5000FF]">Детали тура</h2>

            <div>
              <label htmlFor="tour-included" className="block text-sm font-medium text-gray-700 mb-2">
                Что включено
              </label>
              <textarea
                id="tour-included"
                name="included"
                value={included}
                onChange={(e) => setIncluded(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                placeholder="Трансфер, питание, экскурсии..."
              />
            </div>

            <div>
              <label htmlFor="tour-notIncluded" className="block text-sm font-medium text-gray-700 mb-2">
                Что не включено
              </label>
              <textarea
                id="tour-notIncluded"
                name="notIncluded"
                value={notIncluded}
                onChange={(e) => setNotIncluded(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                placeholder="Авиабилеты, страховка..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Программа тура</h3>
                <button
                  type="button"
                  onClick={addDay}
                  className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-200"
                >
                  + Добавить день
                </button>
              </div>

              {itinerary.map((day, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">День {day.day}</h4>
                    {itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="text-red-600 hover:text-red-700 cursor-pointer transition-colors duration-200"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название
                    </label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => updateDay(index, "title", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                      placeholder="Заголовок дня"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={day.description}
                      onChange={(e) => updateDay(index, "description", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-[#1A2B48]"
                      placeholder="Описание программы дня..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case Step.GALLERY:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#5000FF]">Галерея изображений</h2>
            <p className="text-[#1A2B48]">
              Загрузите изображения тура. Первое изображение будет главным.
            </p>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        );

      case Step.REVIEW:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-[#5000FF]">Проверка и сохранение</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Информация о туре</h3>
                <p className="text-[#1A2B48]">Название: {title}</p>
                <p className="text-[#1A2B48]">Локация: {address}</p>
                <p className="text-[#1A2B48]">Цена: {price} ₽</p>
                {duration && <p className="text-[#1A2B48]">Длительность: {duration} дней</p>}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Программа ({itinerary.length} дней)</h3>
                {itinerary.map((day, index) => (
                  <div key={index} className="ml-4 text-[#1A2B48]">
                    День {day.day}: {day.title}
                  </div>
                ))}
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
                    : "bg-gray-200 text-[#1A2B48]"
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
          <span className="text-xs text-[#1A2B48]">Инфо</span>
          <span className="text-xs text-[#1A2B48]">Детали</span>
          <span className="text-xs text-[#1A2B48]">Фото</span>
          <span className="text-xs text-[#1A2B48]">Готово</span>
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
          disabled={currentStep === Step.TOUR_INFO}
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
            {loading ? "Сохранение…" : "Сохранить тур"}
          </button>
        )}
      </div>
    </div>
  );
}
