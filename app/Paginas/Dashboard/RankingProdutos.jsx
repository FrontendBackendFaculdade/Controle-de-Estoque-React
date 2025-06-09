import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from "expo-router";
import { BarChart } from "react-native-chart-kit";

// Certifique-se de instalar: npx expo install react-native-chart-kit

const ProdutosMaisVendidos = () => {
    const router = useRouter();

    // Estados para os dados, filtros e controle de UI
    const [produtos, setProdutos] = useState([]); // Armazena a lista COMPLETA e processada de produtos
    const [dadosFiltrados, setDadosFiltrados] = useState([]); // Armazena os produtos após o filtro de setor
    const [setores, setSetores] = useState([]); // Armazena a lista de setores únicos
    const [setorSelecionado, setSetorSelecionado] = useState('Todos');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // useEffect para buscar e processar dados de AMBAS as APIs
    useEffect(() => {
        const fetchAndProcessData = async () => {
            try {
                // 1. Busca dados das duas APIs em paralelo para mais eficiência
                const [vendasResponse, produtosResponse] = await Promise.all([
                    fetch('https://backend-do-controle-de-estoque.onrender.com/listitensvendas'),
                    fetch('https://backend-do-controle-de-estoque.onrender.com/listprodutos')
                ]);

                if (!vendasResponse.ok || !produtosResponse.ok) {
                    throw new Error('Falha ao buscar dados de uma das APIs.');
                }

                const vendasData = await vendasResponse.json();
                const produtosData = await produtosResponse.json();

                // 2. Cria um mapa de consulta para encontrar o setor de um produto pelo nome
                // Isso otimiza a busca do setor para cada item vendido.
                const setorLookup = produtosData.reduce((map, produto) => {
                    // Normaliza para minúsculas para evitar problemas de case (ex: "Coca" vs "coca")
                    map[produto.produto.toLowerCase()] = produto.setor;
                    return map;
                }, {});

                // 3. Agrega os dados de vendas e "enriquece" com o setor do mapa de consulta
                const vendasAgregadas = vendasData.reduce((acc, item) => {
                    const nome = item.nomeProduto;
                    const quantidade = parseInt(item.quantidade, 10);
                    // Busca o setor no mapa. Se não encontrar, define como 'Não Categorizado'.
                    const setor = setorLookup[nome.toLowerCase()] || 'Não Categorizado';

                    if (acc[nome]) {
                        acc[nome].vendas += quantidade;
                    } else {
                        acc[nome] = { nome: nome, vendas: quantidade, setor: setor };
                    }
                    return acc;
                }, {});

                // 4. Converte o objeto para array e ordena
                const produtosProcessados = Object.values(vendasAgregadas).sort((a, b) => b.vendas - a.vendas);

                setProdutos(produtosProcessados);
                // Gera a lista de setores únicos a partir dos dados processados e adiciona "Todos"
                setSetores(['Todos', ...new Set(produtosProcessados.map(p => p.setor))]);

            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndProcessData();
    }, []);

    // useEffect para filtrar os dados sempre que o setor selecionado ou a lista de produtos mudar
    useEffect(() => {
        let filtrados;
        if (setorSelecionado === 'Todos') {
            filtrados = produtos;
        } else {
            filtrados = produtos.filter(p => p.setor === setorSelecionado);
        }
        setDadosFiltrados(filtrados);
    }, [setorSelecionado, produtos]);


    // Prepara os dados para o gráfico a partir dos DADOS FILTRADOS
    const chartData = {
        labels: dadosFiltrados.map(p => p.nome),
        datasets: [{ data: dadosFiltrados.map(p => p.vendas) }],
    };

    const screenWidth = Dimensions.get("window").width;
    const larguraPorBarra = 80;
    const larguraCalculadaDoGrafico = dadosFiltrados.length * larguraPorBarra;
    const larguraFinalDoGrafico = Math.max(screenWidth - 40, larguraCalculadaDoGrafico);

    const chartConfig = {
        backgroundGradientFrom: "#ffffff", backgroundGradientTo: "#ffffff", color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`, barPercentage: 0.8,
    };

    if (isLoading) return <View style={styles.centeredView}><ActivityIndicator size="large" color="#007AFF" /><Text style={{ marginTop: 10 }}>Carregando dados...</Text></View>;
    if (error) return <View style={styles.centeredView}><Text style={{ color: 'red' }}>Erro: {error}</Text></View>;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.headerText}>Produtos Mais Vendidos</Text>

                {/* Card de Filtros */}
                <View style={styles.card}>
                    <Text style={styles.chartTitle}>Filtrar por Setor</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
                        {setores.map(setor => (
                            <TouchableOpacity
                                key={setor}
                                style={[styles.filterButton, setorSelecionado === setor && styles.filterButtonActive]}
                                onPress={() => setSetorSelecionado(setor)}
                            >
                                <Text style={[styles.filterButtonText, setorSelecionado === setor && styles.filterButtonTextActive]}>{setor}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {dadosFiltrados.length > 0 ? (
                    <>
                        {/* Card do Gráfico */}
                        <View style={styles.card}>
                            <Text style={styles.chartTitle}>Ranking de Vendas</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                                <BarChart data={chartData} width={larguraFinalDoGrafico} height={320} chartConfig={chartConfig} fromZero={true} style={styles.chartStyle} showValuesOnTopOfBars={true} yAxisLabel="" yAxisSuffix="" />
                            </ScrollView>
                        </View>

                        {/* Card de Detalhes */}
                        <View style={styles.card}>
                            <Text style={styles.chartTitle}>Detalhes</Text>
                            {dadosFiltrados.map((item, index) => (
                                <View key={index} style={styles.listItem}>
                                    <Text style={styles.listItemText}>{index + 1}. {item.nome}</Text>
                                    <Text style={styles.listItemValue}>{item.vendas} vendas</Text>
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.noDataText}>Nenhum produto encontrado para o setor selecionado.</Text>
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
    headerText: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1a202c', paddingVertical: 20, paddingTop: 40, },
    card: { backgroundColor: '#fff', marginHorizontal: 15, borderRadius: 12, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5, },
    chartTitle: { fontSize: 18, fontWeight: '700', color: '#2d3748', marginBottom: 15, textAlign: 'center', },
    filterContainer: { paddingHorizontal: 5 },
    filterButton: { backgroundColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginHorizontal: 5, },
    filterButtonActive: { backgroundColor: '#007AFF' },
    filterButtonText: { color: '#4a5568', fontWeight: '600' },
    filterButtonTextActive: { color: '#fff' },
    chartStyle: { borderRadius: 16 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#edf2f7', alignItems: 'center' },
    listItemText: { fontSize: 16, color: '#4a5568', flex: 1, paddingRight: 8 },
    listItemValue: { fontSize: 16, fontWeight: '600', color: '#2d3748' },
    noDataText: { textAlign: 'center', fontSize: 16, color: '#718096', paddingVertical: 20 },
    footerButtons: { padding: 15, paddingBottom: 25, borderTopWidth: 1, borderTopColor: '#e2e8f0', backgroundColor: '#fff' },
    button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    backButton: { backgroundColor: '#6c757d' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default ProdutosMaisVendidos;