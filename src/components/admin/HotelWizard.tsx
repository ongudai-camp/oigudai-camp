"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHotelAction } from "@/app/actions/hotel";
import { getRoomTypesAction, getFacilitiesAction } from "@/app/actions/room-meta";
import ImageUploader from "./ImageUploader";

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

  // Meta data
  const [roomTypes, setRoomTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [facilities, setFacilities] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    async function fetchMeta() {
      const typesRes = await getRoomTypesAction();
      const facRes = await getFacilitiesAction();
      if (typesRes.types) setRoomTypes(typesRes.types);
      if (facRes.facilities) setFacilities(facRes.facilities);
    }
    fetchMeta();
  }, []);

  // Hotel info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Gallery
  const [images, setImages] = useState<string[]>([]);

  // Rooms
  interface RoomData {
    title: string;
    description: string;
    price: string;
    guests: number;
    beds: number;
    bathrooms: number;
    floor: number | null;
    roomTypeId: number | null;
    facilityIds: number[];
  }

  const [rooms, setRooms] = useState<RoomData[]>([
    { title: "", description: "", price: "", guests: 1, beds: 1, bathrooms: 1, floor: null, roomTypeId: null, facilityIds: [] },
  ]);

  const addRoom = () => {
    setRooms([...rooms, { title: "", description: "", price: "", guests: 1, beds: 1, bathrooms: 1, floor: null, roomTypeId: null, facilityIds: [] }]);
  };

  const updateRoom = (index: number, field: keyof RoomData, value: string | number | null | number[]) => {
    const newRooms = [...rooms];
    (newRooms[index] as RoomData)[field] = value as never;
    setRooms(newRooms);
  };

  const toggleFacility = (roomIndex: number, facilityId: number) => {
    const newRooms = [...rooms];
    const currentFacilities = [...newRooms[roomIndex].facilityIds];
    const index = currentFacilities.indexOf(facilityId);
    if (index === -1) {
      currentFacilities.push(facilityId);
    } else {
      currentFacilities.splice(index, 1);
    }
    newRooms[roomIndex].facilityIds = currentFacilities;
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
      if (images.length > 0) {
        formData.append("featuredImage", images[0]);
        formData.append("gallery", JSON.stringify(images));
      }

      const result = await createHotelAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/hotels");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
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
              <label htmlFor="hotel-title" className="block text-sm font-medium text-gray-700 mb-2">
                Название отеля *
              </label>
              <input
                id="hotel-title"
                name="title"
                type="text"
                required
                autoComplete="off"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Например: Grand Hotel Ongudai"
              />
            </div>

            <div>
              <label htmlFor="hotel-description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="hotel-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="Описание отеля..."
              />
            </div>

            <div>
              <label htmlFor="hotel-address" className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                id="hotel-address"
                name="address"
                type="text"
                autoComplete="street-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                placeholder="с. Онгудай, ул. Центральная, 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hotel-price" className="block text-sm font-medium text-gray-700 mb-2">
                  Цена за ночь (₽) *
                </label>
                <input
                  id="hotel-price"
                  name="price"
                  type="number"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="3000"
                />
              </div>

              <div>
                <label htmlFor="hotel-salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Цена со скидкой (₽)
                </label>
                <input
                  id="hotel-salePrice"
                  name="salePrice"
                  type="number"
                  inputMode="numeric"
                  autoComplete="off"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="2500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="hotel-latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Широта
                </label>
                <input
                  id="hotel-latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  autoComplete="off"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  placeholder="50.123456"
                />
              </div>

              <div>
                <label htmlFor="hotel-longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Долгота
                </label>
                <input
                  id="hotel-longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  inputMode="decimal"
                  autoComplete="off"
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
              <div key={index} className="bg-gray-50 rounded-lg p-6 space-y-4 border border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg">Номер {index + 1}</h3>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`hotel-roomType-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Тип проживания
                    </label>
                    <select
                      id={`hotel-roomType-${index}`}
                      name="roomTypeId"
                      value={room.roomTypeId || ""}
                      onChange={(e) => updateRoom(index, "roomTypeId", e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">Выберите тип</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`hotel-roomTitle-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Название номера *
                    </label>
                    <input
                      id={`hotel-roomTitle-${index}`}
                      name="roomTitle"
                      type="text"
                      required
                      autoComplete="off"
                      value={room.title}
                      onChange={(e) => updateRoom(index, "title", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      placeholder="Напр: Коттедж двухместный"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`hotel-roomDesc-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    id={`hotel-roomDesc-${index}`}
                    name="roomDescription"
                    value={room.description}
                    onChange={(e) => updateRoom(index, "description", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    placeholder="Описание номера..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor={`hotel-roomPrice-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Цена (₽) *
                    </label>
                    <input
                      id={`hotel-roomPrice-${index}`}
                      name="roomPrice"
                      type="number"
                      required
                      inputMode="numeric"
                      autoComplete="off"
                      value={room.price}
                      onChange={(e) => updateRoom(index, "price", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label htmlFor={`hotel-roomGuests-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Гостей
                    </label>
                    <input
                      id={`hotel-roomGuests-${index}`}
                      name="roomGuests"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      autoComplete="off"
                      value={room.guests}
                      onChange={(e) => updateRoom(index, "guests", parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label htmlFor={`hotel-roomFloor-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Этаж
                    </label>
                    <input
                      id={`hotel-roomFloor-${index}`}
                      name="roomFloor"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      autoComplete="off"
                      value={room.floor || ""}
                      onChange={(e) => updateRoom(index, "floor", e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                      placeholder="Любой"
                    />
                  </div>

                  <div>
                    <label htmlFor={`hotel-roomBeds-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Кроватей
                    </label>
                    <input
                      id={`hotel-roomBeds-${index}`}
                      name="roomBeds"
                      type="number"
                      min="1"
                      inputMode="numeric"
                      autoComplete="off"
                      value={room.beds}
                      onChange={(e) => updateRoom(index, "beds", parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                    Удобства в номере
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {facilities.map((facility) => (
                      <label key={facility.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors">
                        <input
                          type="checkbox"
                          checked={room.facilityIds.includes(facility.id)}
                          onChange={() => toggleFacility(index, facility.id)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{facility.name}</span>
                      </label>
                    ))}
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
            <ImageUploader images={images} onChange={setImages} />
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
              {images.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900">Изображения ({images.length})</h3>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">Номера ({rooms.length})</h3>
                {rooms.map((room, index) => (
                  <div key={index} className="ml-4 text-gray-600 border-l-2 border-gray-200 pl-4 py-1 mb-2">
                    <p className="font-medium">{room.title} - {room.price} ₽</p>
                    <p className="text-sm">
                      Тип: {roomTypes.find(t => t.id === room.roomTypeId)?.name || "Не указан"} | 
                      Гостей: {room.guests} | 
                      Этаж: {room.floor || "Любой"}
                    </p>
                    <p className="text-xs italic">
                      Удобств: {room.facilityIds.length}
                    </p>
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
            {loading ? "Сохранение…" : "Сохранить отель"}
          </button>
        )}
      </div>
    </div>
  );
}
