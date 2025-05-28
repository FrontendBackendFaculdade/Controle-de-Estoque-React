import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ConsultaVendas = () => {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Consultar Vendas</Text>

            {/* Aqui futuramente pode ir a lista ou interface de vendas */}
            <Text style={styles.placeholderText}>Em breve: Lista de vendas aparecerá aqui.</Text>

            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
               
                <Text style={styles.backButtonText}>Voltar</Text>
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
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 40,
        textAlign: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#555',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    icon: {
        marginRight: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ConsultaVendas;
