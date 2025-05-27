import { View, Text, TextInput, Button, StyleSheet,TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";

const CadastroProduto = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Cadastro de Produto</Text>
            <TextInput placeholder="Nome do produto" style={styles.input} />
            <TextInput placeholder="Quantidade" style={styles.input} keyboardType="numeric" />
            <TextInput placeholder="Preço unitário" style={styles.input} keyboardType="numeric" />
            <Button title="Salvar" onPress={() => alert('Produto cadastrado!')} />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    backButton: {
        backgroundColor: '#555',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    input: {
        backgroundColor: 'white',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5
    }
});

export default CadastroProduto;
