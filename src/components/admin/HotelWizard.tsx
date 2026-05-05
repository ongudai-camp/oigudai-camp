"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHotelAction } from "@/app/actions/hotel";

enum Step {
  HOTEL_INFO = 1,
  ROOMS = 2,
  GALLERY = 3,
  REVIEW = 4,
}

export default function HotelWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(Step.HOTEL_INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Hotel info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Rooms
  const [rooms, setRooms] = useState([
    { title: "", description: "", price: "", guests: 1, beds: 1, bathrooms: 1 },
  ]);

  const addRoom = () => {
    setRooms([...rooms, { title: "", description: "", price: "", guests: 1, beds: 1, bathrooms: 1 }]);
  };

  const updateRoom = (index: number, field: string, value: any) => {
    const newRooms = [...rooms];
    (newRooms[index] as any)[field] = value;
    setRooms(newRooms);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
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
      if (latitude) formData.append("latitude", latitude);
      if (longitude) formData.append("longitude", longitude);
      formData.append("rooms", JSON.stringify(rooms));

      const result = await createHotelAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/hotels");
      }
    } catch (err: any) {
      setError(err.message || "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.HOTEL_INFO:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Информация об отеле</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название отеля *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Например: Grand Hotel Ongudai"
              />
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
                placeholder="Описание отеля..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="с. Онгудай, ул. Центральная, 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена за ночь (₽) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="3000"
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
                  placeholder="2500"
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
                  placeholder="50.123456"
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
                  placeholder="85.123456"
                />
              </div>
            </div>
          </div>
        );

      case Step.ROOMS:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Номера отеля</h2>
              <button
                type="button"
                onClick={addRoom}
                className="text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-200"
              >
                + Добавить номер
              </button>
            </div>

            {rooms.map((room, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Номер {index + 1}</h3>
                  {rooms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="text-red-600 hover:text-red-700 cursor-pointer transition-colors duration-200"
                    >
                      Удалить
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название номера *
                  </label>
                  <input
                    type="text"
                    required
                    value={room.title}
                    onChange={(e) => updateRoom(index, "title", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    placeholder="Стандарт"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    value={room.description}
                    onChange={(e) => updateRoom(index, "description", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    placeholder="Описание номера..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цена за ночь (₽) *
                    </label>
                    <input
                      type="number"
                      required
                      value={room.price}
                      onChange={(e) => updateRoom(index, "price", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      placeholder="2000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Гостей
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={room.guests}
                      onChange={(e) => updateRoom(index, "guests", parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Кроватей
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={room.beds}
                      onChange={(e) => updateRoom(index, "beds", parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ванных
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={room.bathrooms}
                      onChange={(e) => updateRoom(index, "bathrooms", parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case Step.GALLERY:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Галерея изображений</h2>
            <p className="text-gray-600">
              Загрузите изображения отеля. Первое изображение будет главным.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">Перетащите изображения сюда или нажмите для выбора</p>
              <input type="file" multiple accept="image/*" className="hidden" />
              <button
                type="button"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200"
              >
                Выбрать файлы
              </button>
            </div>
          </div>
        );

      case Step.REVIEW:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Проверка и сохранение</h2>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Информация об отеле</h3>
                <p className="text-gray-600">Название: {title}</p>
                <p className="text-gray-600">Адрес: {address}</p>
                <p className="text-gray-600">Цена: {price} ₽</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Номера ({rooms.length})</h3>
                {rooms.map((room, index) => (
                  <div key={index} className="ml-4 text-gray-600">
                    {index + 1}. {room.title} - {room.price} ₽
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
              className={`flex items-center ${
                step < 4 ? "flex-1" : ""
              }`}
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
          <span className="text-xs text-gray-500">Номера</span>
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
          disabled={currentStep === Step.HOTEL_INFO}
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
            {loading ? "Сохранение..." : "Сохранить отель"}
          </button>
        )}
      </div>
    </div>
  );
}
