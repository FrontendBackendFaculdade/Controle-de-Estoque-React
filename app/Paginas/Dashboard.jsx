import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from "expo-router";
import Ionicons from 'react-native-vector-icons/Ionicons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    gridContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    tile: {
        width: '90%',
        height: 80,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
        flexDirection: 'row',
    },
    tileIconContainer: {
        marginRight: 15,
    },
    tileText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
        flexShrink: 1,
    },
    backButtonContainer: {
        marginTop: 30,
        alignSelf: 'center',
        width: '80%',
    },
    backButton: {
        backgroundColor: '#555',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

const DashBoard = () => {
    const router = useRouter();

    const apps = [
        { name: 'Formas de pagamento mais utilizadas', icon: 'stats-chart-outline', route: '/Paginas/SubPaginas/RankingFormaPagamento' },
        { name: 'Produtos mais vendidos', icon: 'pricetag-outline', route: '/Paginas/SubPaginas/RankingProdutos' },
        { name: 'Clientes que mais compraram', icon: 'people-outline', route: '/Paginas/SubPaginas/RankingClientes' },
    ];

    const handleVoltar = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Dashboard</Text>
            </View>
            <View style={styles.gridContainer}>
                {apps.map((app) => (
                    <TouchableOpacity
                        key={app.route}
                        style={styles.tile}
                        onPress={() => router.push(app.route)}
                    >
                        <View style={styles.tileIconContainer}>
                            <Ionicons name={app.icon} size={32} color="#5A5A5A" />
                        </View>
                        <Text style={styles.tileText}>{app.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.backButtonContainer}>
                <TouchableOpacity style={styles.backButton} onPress={handleVoltar}>
                    <Text style={styles.backButtonText}>VOLTAR</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default DashBoard;
