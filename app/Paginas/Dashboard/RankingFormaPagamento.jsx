import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from "expo-router";
import { PieChart } from "react-native-chart-kit";
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const FormasPagamentoDashboard = () => {
    const router = useRouter();

    const [vendas, setVendas] = useState([]);
    const [formasPagamentoMap, setFormasPagamentoMap] = useState({});
    const [clientes, setClientes] = useState([]);
    const [dadosAgregados, setDadosAgregados] = useState([]);
    
    const [clienteSelecionado, setClienteSelecionado] = useState('Todos');
    const [dataInicial, setDataInicial] = useState(null);
    const [dataFinal, setDataFinal] = useState(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState('inicial');

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendasRes, formasRes] = await Promise.all([
                    fetch('https://backend-do-controle-de-estoque.onrender.com/listvendas'),
                    fetch('https://backend-do-controle-de-estoque.onrender.com/listformas')
                ]);

                if (!vendasRes.ok || !formasRes.ok) throw new Error('Falha ao buscar dados das APIs.');

                const vendasData = await vendasRes.json();
                const formasData = await formasRes.json();

                const formasMap = formasData.reduce((map, forma) => {
                    // --- ALTERAÇÃO APLICADA AQUI ---
                    // A verificação do campo 'ativo' foi removida.
                    // Todas as formas de pagamento serão consideradas.
                    map[parseInt(forma.codigo, 10)] = forma.nome;
                    // ---------------------------------
                    return map;
                }, {});

                const listaClientes = ['Todos', ...new Set(vendasData.map(v => v.nomeCliente).filter(Boolean))];

                setFormasPagamentoMap(formasMap);
                setVendas(vendasData);
                setClientes(listaClientes);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let dadosFiltrados = [...vendas];

        if (clienteSelecionado && clienteSelecionado !== 'Todos') {
            dadosFiltrados = dadosFiltrados.filter(v => v.nomeCliente === clienteSelecionado);
        }
        if (dataInicial) {
            dadosFiltrados = dadosFiltrados.filter(v => new Date(v.dataHora) >= dataInicial);
        }
        if (dataFinal) {
            const dataFim = new Date(dataFinal);
            dataFim.setHours(23, 59, 59, 999);
            dadosFiltrados = dadosFiltrados.filter(v => new Date(v.dataHora) <= dataFim);
        }

        const agregados = dadosFiltrados.reduce((acc, venda) => {
            const codigoDaVenda = parseInt(venda.CodFormadePagamento, 10);
            const nomeForma = formasPagamentoMap[codigoDaVenda] || 'Desconhecida';
            
            acc[nomeForma] = (acc[nomeForma] || 0) + 1;
            return acc;
        }, {});

        const cores = ['#007AFF', '#34C759', '#FF9500', '#5856D6', '#AF52DE', '#FF3B30', '#5AC8FA', '#FFCC00'];
        const dadosFormatados = Object.entries(agregados)
            .map(([nome, uso], index) => ({
                name: nome,
                population: uso,
                color: cores[index % cores.length],
                legendFontColor: "#7F7F7F",
                legendFontSize: 15
            }))
            .sort((a, b) => b.population - a.population);

        setDadosAgregados(dadosFormatados);
    }, [vendas, formasPagamentoMap, clienteSelecionado, dataInicial, dataFinal]);

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

    if (isLoading) return <View style={styles.centeredView}><ActivityIndicator size="large" color="#007AFF" /></View>;
    if (error) return <View style={styles.centeredView}><Text style={{ color: 'red' }}>Erro: {error}</Text></View>;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.headerText}>Formas de Pagamento</Text>

                <View style={styles.card}>
                    <Text style={styles.chartTitle}>Filtros</Text>
                    <Text style={styles.label}>Cliente:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={clienteSelecionado} onValueChange={(itemValue) => setClienteSelecionado(itemValue)}>
                            {clientes.map(c => <Picker.Item key={c} label={c} value={c} />)}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Período:</Text>
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

                {showDatePicker && (
                    <DateTimePicker
                        value={datePickerMode === 'inicial' ? (dataInicial || new Date()) : (dataFinal || new Date())}
                        mode="date" display="default" onChange={onDateChange}
                    />
                )}
                
                {dadosAgregados.length > 0 ? (
                    <>
                        <View style={styles.card}>
                            <Text style={styles.chartTitle}>Uso por Forma de Pagamento</Text>
                            <PieChart
                                data={dadosAgregados}
                                width={Dimensions.get("window").width - 40}
                                height={220}
                                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={"15"}
                                center={[10, 0]}
                                absolute
                            />
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.chartTitle}>Detalhes</Text>
                            {dadosAgregados.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <View style={[styles.colorDot, {backgroundColor: item.color}]} />
                                        <Text style={styles.listItemText}>{index + 1}. {item.name}</Text>
                                    </View>
                                    <Text style={styles.listItemValue}>{item.population} {item.population > 1 ? 'vendas' : 'venda'}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.noDataText}>Nenhum resultado encontrado para os filtros aplicados.</Text>
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
    label: { fontSize: 16, color: '#4a5568', fontWeight: '600', marginBottom: 5, },
    pickerContainer: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, marginBottom: 15, justifyContent: 'center' },
    dateContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    dateButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignItems: 'center', marginHorizontal: 5, },
    clearButton: { alignSelf: 'center', padding: 8 },
    clearButtonText: { color: '#007AFF', fontSize: 14 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7' },
    colorDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
    listItemText: { fontSize: 16, color: '#4a5568' },
    listItemValue: { fontSize: 16, fontWeight: '600', color: '#2d3748' },
    noDataText: { textAlign: 'center', fontSize: 16, color: '#718096', paddingVertical: 20 },
    footerButtons: { padding: 15, paddingBottom: 25, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
    button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    backButton: { backgroundColor: '#6c757d' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default FormasPagamentoDashboard;