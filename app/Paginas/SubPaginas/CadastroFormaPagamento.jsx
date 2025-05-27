import React from 'react';
import { View, Text, TextInput, Button, StyleSheet,TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";

const CadastroFormaPagamento = () => {
    const router = useRouter();
    const [nome, setNome] = React.useState('');

    const handleSalvar = () => {
        if (!nome) {
            alert('Preencha o nome da forma de pagamento!');
            return;
        }
        alert('Forma de pagamento cadastrada!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Cadastro de Forma de Pagamento</Text>
            <TextInput
                placeholder="Nome da forma de pagamento"
                style={styles.input}
                value={nome}
                onChangeText={setNome}
            />
            <Button title="Salvar" onPress={handleSalvar} />
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

export default CadastroFormaPagamento;
