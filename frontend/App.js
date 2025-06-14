import {
    Camera,
    ChevronRight,
    DollarSign,
    Instagram,
    MapPin,
    Search,
    Upload,
    User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function BeforeTheHoneymoon() {
    const [destination, setDestination] = useState("");
    const [nationality, setNationality] = useState("");
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
                "https://images.unsplash.com/photo-1591604466107-ec97de577aff",
            ],
            instagramUrl: "https://instagram.com/paris_wedding_photos",
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
                "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65",
            ],
            instagramUrl: "https://instagram.com/eiffel_moments",
        },
    ];

    // 画像アップロード（デモ: 実際はImagePicker等を使う）
    const handleImageUpload = async () => {
        Alert.alert(
            "画像アップロード",
            "実際の画像アップロードは未実装です。\nデモ用画像をセットします。",
            [
                {
                    text: "OK",
                    onPress: () =>
                        setUploadedImage(
                            "https://images.unsplash.com/photo-1519741497674-611481863552",
                        ),
                },
            ],
        );
    };

    const handleSearch = () => {
        if (!destination || !nationality || !uploadedImage) {
            Alert.alert("エラー", "すべての項目を入力してください");
            return;
        }

        setIsSearching(true);

        setTimeout(() => {
            setSearchResults(dummyPhotographers);
            setIsSearching(false);
        }, 2000);
    };

    const handlePhotographerClick = (url) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.inner}>
                {/* ヘッダー */}
                <View style={styles.header}>
                    <Text style={styles.title}>Before the honeymoon</Text>
                    <Text style={styles.subtitle}>
                        海外で理想のフォトグラファーを見つけよう
                    </Text>
                </View>

                {!searchResults
                    ? (
                        // 検索フォーム
                        <View style={styles.formBox}>
                            {/* 行き先入力 */}
                            <View style={styles.inputBlock}>
                                <View style={styles.labelRow}>
                                    <MapPin
                                        size={20}
                                        color="#a855f7"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.label}>行き先</Text>
                                </View>
                                <TextInput
                                    placeholder="例: パリ、グアム、バリ島"
                                    value={destination}
                                    onChangeText={setDestination}
                                    style={styles.input}
                                    placeholderTextColor="#aaa"
                                />
                            </View>

                            {/* 国籍入力 */}
                            <View style={styles.inputBlock}>
                                <View style={styles.labelRow}>
                                    <User
                                        size={20}
                                        color="#a855f7"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.label}>
                                        あなたの国籍
                                    </Text>
                                </View>
                                <TextInput
                                    placeholder="例: 日本人、韓国人、アメリカ人"
                                    value={nationality}
                                    onChangeText={setNationality}
                                    style={styles.input}
                                    placeholderTextColor="#aaa"
                                />
                            </View>

                            {/* 画像アップロード */}
                            <View style={styles.inputBlock}>
                                <View style={styles.labelRow}>
                                    <Camera
                                        size={20}
                                        color="#a855f7"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.label}>
                                        参考にしたい写真
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.uploadBox}
                                    onPress={uploadedImage
                                        ? () => setUploadedImage(null)
                                        : handleImageUpload}
                                    activeOpacity={0.8}
                                >
                                    {uploadedImage
                                        ? (
                                            <View
                                                style={{ alignItems: "center" }}
                                            >
                                                <Image
                                                    source={{
                                                        uri: uploadedImage,
                                                    }}
                                                    style={styles.uploadedImage}
                                                />
                                                <Text style={styles.deleteText}>
                                                    画像を削除
                                                </Text>
                                            </View>
                                        )
                                        : (
                                            <View
                                                style={{ alignItems: "center" }}
                                            >
                                                <Upload
                                                    size={48}
                                                    color="#aaa"
                                                />
                                                <Text style={styles.uploadText}>
                                                    タップして画像をアップロード
                                                </Text>
                                            </View>
                                        )}
                                </TouchableOpacity>
                            </View>

                            {/* 検索ボタン */}
                            <TouchableOpacity
                                onPress={handleSearch}
                                disabled={isSearching}
                                style={[
                                    styles.searchButton,
                                    isSearching && { backgroundColor: "#ddd" },
                                ]}
                                activeOpacity={0.8}
                            >
                                {isSearching
                                    ? <ActivityIndicator color="#fff" />
                                    : (
                                        <View
                                            style={styles.searchButtonContent}
                                        >
                                            <Search size={20} color="#fff" />
                                            <Text
                                                style={styles.searchButtonText}
                                            >
                                                フォトグラファーを探す
                                            </Text>
                                        </View>
                                    )}
                            </TouchableOpacity>
                        </View>
                    )
                    : (
                        // 検索結果
                        <View>
                            <TouchableOpacity
                                onPress={() => setSearchResults(null)}
                                style={styles.backButton}
                            >
                                <Text style={styles.backButtonText}>
                                    ← 検索条件を変更
                                </Text>
                            </TouchableOpacity>

                            {searchResults.map((photographer) => (
                                <View
                                    key={photographer.id}
                                    style={styles.resultBox}
                                >
                                    <View style={styles.resultHeader}>
                                        <Instagram size={32} color="#ec4899" />
                                        <Text style={styles.resultName}>
                                            {photographer.name}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() =>
                                                handlePhotographerClick(
                                                    photographer.instagramUrl,
                                                )}
                                            style={styles.instagramButton}
                                        >
                                            <Text
                                                style={styles
                                                    .instagramButtonText}
                                            >
                                                Instagramを見る
                                            </Text>
                                            <ChevronRight
                                                size={16}
                                                color="#fff"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.resultInfoRow}>
                                        <Text style={styles.resultInfoLabel}>
                                            バックグラウンド:
                                        </Text>
                                        <Text style={styles.resultInfoText}>
                                            {photographer.background}
                                        </Text>
                                    </View>
                                    <View style={styles.resultInfoRow}>
                                        <Text style={styles.resultInfoLabel}>
                                            撮影経験のある国籍:
                                        </Text>
                                        <Text style={styles.resultInfoText}>
                                            {photographer
                                                .experienceWithNationalities
                                                .join(", ")}
                                        </Text>
                                    </View>
                                    <View style={styles.resultInfoRow}>
                                        <DollarSign size={20} color="#22c55e" />
                                        <Text
                                            style={[styles.resultInfoLabel, {
                                                marginLeft: 4,
                                            }]}
                                        >
                                            料金相場:
                                        </Text>
                                        <Text style={styles.resultInfoText}>
                                            {photographer.priceRange}
                                        </Text>
                                    </View>
                                    <Text style={styles.portfolioLabel}>
                                        ポートフォリオ
                                    </Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                    >
                                        {photographer.portfolio.map((
                                            photo,
                                            idx,
                                        ) => (
                                            <Image
                                                key={idx}
                                                source={{ uri: photo }}
                                                style={styles.portfolioImage}
                                            />
                                        ))}
                                    </ScrollView>
                                </View>
                            ))}
                        </View>
                    )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fdf6fb",
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 32,
    },
    inner: {
        maxWidth: 800,
        alignSelf: "center",
        width: "100%",
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
        paddingTop: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#2d2d2d",
        marginBottom: 8,
    },
    subtitle: {
        color: "#666",
        fontSize: 16,
    },
    formBox: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    inputBlock: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    label: {
        fontWeight: "bold",
        color: "#333",
        fontSize: 16,
    },
    icon: {
        marginRight: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: Platform.OS === "ios" ? 14 : 10,
        backgroundColor: "#fafafa",
        fontSize: 16,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        minHeight: 120,
    },
    uploadText: {
        color: "#666",
        marginTop: 8,
    },
    uploadedImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    deleteText: {
        color: "red",
        marginTop: 4,
        fontWeight: "bold",
    },
    searchButton: {
        backgroundColor: "#a855f7",
        borderRadius: 8,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
    },
    searchButtonContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    searchButtonText: {
        color: "#fff",
        fontWeight: "bold",
        marginLeft: 8,
        fontSize: 16,
    },
    backButton: {
        marginBottom: 24,
    },
    backButtonText: {
        color: "#a855f7",
        fontWeight: "bold",
        fontSize: 16,
    },
    resultBox: {
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    resultHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    resultName: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2d2d2d",
        marginLeft: 8,
    },
    instagramButton: {
        backgroundColor: "#a855f7",
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: "auto",
        flexDirection: "row",
        alignItems: "center",
    },
    instagramButtonText: {
        color: "#fff",
        fontWeight: "bold",
        marginRight: 4,
        fontSize: 14,
    },
    resultInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    resultInfoLabel: {
        fontWeight: "bold",
        marginRight: 4,
        color: "#444",
        fontSize: 15,
    },
    resultInfoText: {
        color: "#333",
        fontSize: 15,
    },
    portfolioLabel: {
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 8,
        color: "#444",
        fontSize: 15,
    },
    portfolioImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 8,
        backgroundColor: "#eee",
    },
});
