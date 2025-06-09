import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from "expo-router";
import { BarChart } from "react-native-chart-kit";
import DateTimePicker from '@react-native-community/datetimepicker';

// Se ainda não tiver, execute: npx expo install @react-native-community/datetimepicker

const ClientesMaisCompraramDashboard = () => {
    const router = useRouter();

    // Estados para os dados brutos e processados
    const [vendas, setVendas] = useState([]); // Armazena os dados brutos da API
    const [clientesAgregados, setClientesAgregados] = useState([]); // Dados processados para exibição

    // Estados dos filtros
    const [dataInicial, setDataInicial] = useState(null);
    const [dataFinal, setDataFinal] = useState(null);
    
    // Estados de controle da UI
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('inicial');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Efeito para buscar os dados brutos da API apenas uma vez
    useEffect(() => {
        const fetchVendas = async () => {
            try {
                const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listvendas');
                if (!response.ok) {
                    throw new Error('Falha ao buscar os dados de vendas.');
                }
                const vendasData = await response.json();
                setVendas(vendasData);
            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendas();
    }, []);

    // Efeito para filtrar e processar os dados sempre que as datas ou os dados brutos mudarem
    useEffect(() => {
        let vendasFiltradas = [...vendas];

        // 1. Filtra por data inicial, se definida
        if (dataInicial) {
            vendasFiltradas = vendasFiltradas.filter(v => new Date(v.dataHora) >= dataInicial);
        }
        // 2. Filtra por data final, se definida
        if (dataFinal) {
            const dataFim = new Date(dataFinal);
            dataFim.setHours(23, 59, 59, 999); // Garante que o dia todo seja incluído
            vendasFiltradas = vendasFiltradas.filter(v => new Date(v.dataHora) <= dataFim);
        }

        // 3. Agrega os valores totais de venda por cliente a partir dos dados JÁ FILTRADOS
        const agregados = vendasFiltradas.reduce((acc, venda) => {
            const nome = venda.nomeCliente;
            const valor = parseFloat(venda.valorTotaldeVenda);

            if (nome && !isNaN(valor)) {
                if (acc[nome]) {
                    acc[nome].valor += valor;
                } else {
                    acc[nome] = { nome: nome, valor: valor };
                }
            }
            return acc;
        }, {});

        // 4. Converte para array e ordena
        const clientesProcessados = Object.values(agregados)
            .sort((a, b) => b.valor - a.valor);

        setClientesAgregados(clientesProcessados);

    }, [vendas, dataInicial, dataFinal]);

    // Funções auxiliares para o seletor de data
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (datePickerMode === 'inicial') setDataInicial(selectedDate);
            else setDataFinal(selectedDate);
        }
    };
    const showDatepickerFor = (mode) => {
        setDatePickerMode(mode);
        setShowDatePicker(true);
    };

    // Prepara dados para o gráfico
    const chartData = {
        labels: clientesAgregados.map(c => c.nome),
        datasets: [{ data: clientesAgregados.map(c => c.valor) }],
    };
    const screenWidth = Dimensions.get("window").width;
    const larguraPorBarra = 120;
    const larguraCalculadaDoGrafico = clientesAgregados.length * larguraPorBarra;
    const larguraFinalDoGrafico = Math.max(screenWidth - 40, larguraCalculadaDoGrafico);
    const chartConfig = { backgroundGradientFrom: "#ffffff", backgroundGradientTo: "#ffffff", color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, strokeWidth: 2, barPercentage: 0.8, labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})` };

    if (isLoading) return <View style={styles.centeredView}><ActivityIndicator size="large" color="#34C759" /></View>;
    if (error) return <View style={styles.centeredView}><Text style={{ color: 'red' }}>Erro: {error}</Text></View>;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.headerText}>Clientes que Mais Compraram</Text>

                {/* Card de Filtros por Período */}
                <View style={styles.card}>
                    <Text style={styles.chartTitle}>Filtro por Período</Text>
                    <View style={styles.dateContainer}>
                        <TouchableOpacity style={styles.dateButton} onPress={() => showDatepickerFor('inicial')}>
                            <Text>{dataInicial ? dataInicial.toLocaleDateString('pt-BR') : 'Data Inicial'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dateButton} onPress={() => showDatepickerFor('final')}>
                            <Text>{dataFinal ? dataFinal.toLocaleDateString('pt-BR') : 'Data Final'}</Text>
                        </TouchableOpacity>
                    </View>
                     <TouchableOpacity style={styles.clearButton} onPress={() => { setDataInicial(null); setDataFinal(null); }}>
                        <Text style={styles.clearButtonText}>Limpar Período</Text>
                    </TouchableOpacity>
                </View>

                {/* Renderização condicional do seletor de data */}
                {showDatePicker && (
                    <DateTimePicker
                        value={datePickerMode === 'inicial' ? (dataInicial || new Date()) : (dataFinal || new Date())}
                        mode="date" display="default" onChange={onDateChange}
                    />
                )}

                {clientesAgregados.length > 0 ? (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.chartTitle}>Ranking por Valor Total (R$)</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                <BarChart
                                    data={chartData} width={larguraFinalDoGrafico} height={320} chartConfig={chartConfig} fromZero={true}
                                    style={styles.chartStyle} yAxisLabel="R$" yAxisSuffix="" showValuesOnTopOfBars={true}
                                />
                            </ScrollView>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.chartTitle}>Detalhes</Text>
                            {clientesAgregados.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.listItemRank}>{index + 1}º</Text>
                                    <Text style={styles.listItemText}>{item.nome}</Text>
                                    <Text style={styles.listItemValue}>
                                        {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.noDataText}>Nenhum cliente encontrado para o período selecionado.</Text>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footerButtons}>
                <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.canGoBack() ? router.back() : null}>
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerText: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1a202c', paddingVertical: 20, paddingTop: 40 },
    card: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
    chartTitle: { fontSize: 18, fontWeight: '700', color: '#2d3748', marginBottom: 15, textAlign: 'center' },
    dateContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    dateButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
    clearButton: { alignSelf: 'center', padding: 8 },
    clearButtonText: { color: '#007AFF', fontSize: 14 },
    chartStyle: { borderRadius: 16 },
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
    listItemRank: { fontSize: 16, fontWeight: '700', color: '#718096', width: 40 },
    listItemText: { flex: 1, fontSize: 16, color: '#4a5568' },
    listItemValue: { fontSize: 16, fontWeight: '600', color: '#2d3748', textAlign: 'right' },
    noDataText: { textAlign: 'center', fontSize: 16, color: '#718096', paddingVertical: 20 },
    footerButtons: { padding: 15, paddingBottom: 25, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
    button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    backButton: { backgroundColor: '#6c757d' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ClientesMaisCompraramDashboard;