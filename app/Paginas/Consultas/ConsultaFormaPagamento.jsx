import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ConsultaFormaPagamento = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Consultar Formas de Pagamento</Text>
            <Text style={styles.placeholder}>Em breve: listagem das formas de pagamento aqui.</Text>

            <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                
                <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    placeholder: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    button: {
        flexDirection: 'row',
        backgroundColor: '#555',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConsultaFormaPagamento;
