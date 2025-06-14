import React, { useState } from 'react';
import { Camera, Upload, MapPin, User, Search, Instagram, DollarSign, ChevronRight } from 'lucide-react';

export default function BeforeTheHoneymoon() {
  const [destination, setDestination] = useState('');
  const [nationality, setNationality] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);

  // デモ用のダミーデータ
  const dummyPhotographers = [
    {
      id: 1,
      name: "@paris_wedding_photos",
      background: "フランス人フォトグラファー",
      experienceWithNationalities: ["日本人", "韓国人", "中国人"],
      priceRange: "€500-800 / session",
      portfolio: [
        "https://images.unsplash.com/photo-1519741497674-611481863552",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486",
        "https://images.unsplash.com/photo-1460978812857-470ed1c77af0",
        "https://images.unsplash.com/photo-1522413452208-996ff3f3e740",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
        "https://images.unsplash.com/photo-1591604466107-ec97de577aff"
      ],
      instagramUrl: "https://instagram.com/paris_wedding_photos"
    },
    {
      id: 2,
      name: "@eiffel_moments",
      background: "イタリア人フォトグラファー",
      experienceWithNationalities: ["日本人", "アメリカ人"],
      priceRange: "€400-700 / session",
      portfolio: [
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a",
        "https://images.unsplash.com/photo-1606216794074-735e91aa2c92",
        "https://images.unsplash.com/photo-1544078751-58fee2d8a03b",
        "https://images.unsplash.com/photo-1529636798458-92182e662485",
        "https://images.unsplash.com/photo-1553915632-175f60dd8e36",
        "https://images.unsplash.com/photo-1591343395082-e120087004b4",
        "https://images.unsplash.com/photo-1550005809-91ad75fb315f",
        "https://images.unsplash.com/photo-1522057384400-681b421cfebc",
        "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65"
      ],
      instagramUrl: "https://instagram.com/eiffel_moments"
    }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = () => {
    if (!destination || !nationality || !uploadedImage) {
      alert('すべての項目を入力してください');
      return;
    }

    setIsSearching(true);

    // APIコール（デモ用に2秒後にダミーデータを返す）
    setTimeout(() => {
      const requestData = {
        destination,
        nationality,
        referenceImage: uploadedImage
      };
      console.log('Request Data:', requestData);

      setSearchResults(dummyPhotographers);
      setIsSearching(false);
    }, 2000);
  };

  const handlePhotographerClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Before the honeymoon</h1>
          <p className="text-gray-600">海外で理想のフォトグラファーを見つけよう</p>
        </div>

        {!searchResults ? (
          /* 検索フォーム */
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <div className="space-y-6">
              {/* 行き先入力 */}
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  行き先
                </label>
                <input
                  type="text"
                  placeholder="例: パリ、グアム、バリ島"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 国籍入力 */}
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <User className="w-5 h-5 mr-2" />
                  あなたの国籍
                </label>
                <input
                  type="text"
                  placeholder="例: 日本人、韓国人、アメリカ人"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* 画像アップロード */}
              <div>
                <label className="flex items-center text-gray-700 font-semibold mb-2">
                  <Camera className="w-5 h-5 mr-2" />
                  参考にしたい写真
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
                  {uploadedImage ? (
                    <div className="space-y-4">
                      <img src={uploadedImage} alt="Uploaded" className="max-h-48 mx-auto rounded-lg" />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        画像を削除
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">クリックして画像をアップロード</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 検索ボタン */}
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSearching ? (
                  <span>検索中...</span>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>フォトグラファーを探す</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* 検索結果 */
          <div>
            <button
              onClick={() => setSearchResults(null)}
              className="mb-6 text-purple-600 hover:text-purple-800 font-semibold flex items-center"
            >
              ← 検索条件を変更
            </button>

            <div className="grid gap-8">
              {searchResults.map((photographer) => (
                <div key={photographer.id} className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Instagram className="w-8 h-8 text-pink-500" />
                        <h2 className="text-2xl font-bold text-gray-800">{photographer.name}</h2>
                      </div>
                      <button
                        onClick={() => handlePhotographerClick(photographer.instagramUrl)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full flex items-center space-x-2 hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        <span>Instagramを見る</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                      <div>
                        <p className="font-semibold mb-1">バックグラウンド</p>
                        <p>{photographer.background}</p>
                      </div>
                      <div>
                        <p className="font-semibold mb-1">撮影経験のある国籍</p>
                        <p>{photographer.experienceWithNationalities.join(", ")}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-semibold">料金相場</p>
                          <p>{photographer.priceRange}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-700 mb-3">ポートフォリオ</p>
                    <div className="grid grid-cols-3 gap-2">
                      {photographer.portfolio.map((photo, index) => (
                        <div key={index} className="aspect-square overflow-hidden rounded-lg">
                          <img
                            src={photo}
                            alt={`Portfolio ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}