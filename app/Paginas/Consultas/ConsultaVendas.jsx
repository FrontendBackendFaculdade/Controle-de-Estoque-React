import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    TextInput,
    Button
} from 'react-native';
import { useRouter } from "expo-router";
import Collapsible from 'react-native-collapsible';

const VisualizarVendas = () => {
    const router = useRouter();

    const [vendas, setVendas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [formasPagamento, setFormasPagamento] = useState([]);
    const [condicoesPagamento, setCondicoesPagamento] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredVendas, setFilteredVendas] = useState([]);
    const [activeSections, setActiveSections] = useState([]);

    const fetchData = async () => {
        try {
            // Busca todos os dados necessários em paralelo para melhor desempenho
            const [vendasRes, clientesRes, formasRes, condicoesRes] = await Promise.all([
                fetch('https://backend-do-controle-de-estoque.onrender.com/listvendas'),
                fetch('https://backend-do-controle-de-estoque.onrender.com/listclientes'),
                fetch('https://backend-do-controle-de-estoque.onrender.com/listformas'),
                fetch('https://backend-do-controle-de-estoque.onrender.com/listcondicoes')
            ]);

            // Verifica se todas as respostas da API foram bem-sucedidas
            if (!vendasRes.ok || !clientesRes.ok || !formasRes.ok || !condicoesRes.ok) {
                throw new Error('Falha ao buscar um ou mais conjuntos de dados.');
            }

            const vendasData = await vendasRes.json();
            const clientesData = await clientesRes.json();
            const formasData = await formasRes.json();
            const condicoesData = await condicoesRes.json();

            // Armazena os dados nos respectivos estados
            if (Array.isArray(vendasData)) {
                const sortedData = vendasData.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
                setVendas(sortedData);
                setFilteredVendas(sortedData);
            }
            if(Array.isArray(clientesData)) setClientes(clientesData);
            if(Array.isArray(formasData)) setFormasPagamento(formasData);
            if(Array.isArray(condicoesData)) setCondicoesPagamento(condicoesData);
            
            setError(null);
        } catch (e) {
            console.error("Erro ao buscar dados:", e);
            setError(e.message || "Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, []);

    useEffect(() => {
        if (searchQuery === '') {
            setFilteredVendas(vendas);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filteredData = vendas.filter(item => {
                const itemCliente = item.nomeCliente ? item.nomeCliente.toLowerCase() : '';
                const itemCodigo = item.codigo ? item.codigo.toString().toLowerCase() : '';
                return itemCliente.includes(lowercasedQuery) || itemCodigo.includes(lowercasedQuery);
            });
            setFilteredVendas(filteredData);
        }
    }, [searchQuery, vendas]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setSearchQuery('');
        setError(null);
        fetchData();
    }, []);

    const toggleSection = (sectionCodigo) => {
        const newActiveSections = activeSections.includes(sectionCodigo)
            ? activeSections.filter(s => s !== sectionCodigo)
            : [...activeSections, sectionCodigo];
        setActiveSections(newActiveSections);
    };

    const formatCurrency = (value) => {
        const number = parseFloat(value);
        if (isNaN(number)) return "R$ 0,00";
        return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return "--";
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const renderVendaItem = ({ item }) => {
        const isExpanded = activeSections.includes(item.codigo);

        // Busca o nome da forma de pagamento correspondente ao código
        const formaPagamento = formasPagamento.find(f => f.codigo === item.CodFormadePagamento);
        const nomeFormaPagamento = formaPagamento ? formaPagamento.nome : `Cód: ${item.CodFormadePagamento}`;

        // Busca a descrição da condição de pagamento correspondente ao código
        const condicaoPagamento = condicoesPagamento.find(c => c.codigo === item.CodCondicaoPagamento);
        const descCondicaoPagamento = condicaoPagamento ? condicaoPagamento.descricao : `Cód: ${item.CodCondicaoPagamento}`;

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => toggleSection(item.codigo)}>
                    <View style={styles.itemHeader}>
                        <View style={{flex: 1}}>
                            <Text style={styles.itemTitle}>Venda #{item.codigo}</Text>
                            <Text style={styles.itemSubtitle}>{item.nomeCliente}</Text>
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                            <Text style={styles.itemValue}>{formatCurrency(item.valorTotaldeVenda)}</Text>
                            <Text style={styles.itemDate}>{formatDate(item.dataHora)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <Collapsible collapsed={!isExpanded}>
                    <View style={styles.collapsibleContent}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Cód. Cliente:</Text>
                            <Text style={styles.detailValue}>{item.codCliente}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Forma Pag.:</Text>
                            <Text style={styles.detailValue}>{nomeFormaPagamento}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Condição Pag.:</Text>
                            <Text style={styles.detailValue}>{descCondicaoPagamento}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Valor Produtos:</Text>
                            <Text style={styles.detailValue}>{formatCurrency(item.valorProdutos)}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Desconto (%):</Text>
                            <Text style={styles.detailValue}>{item.desconto}%</Text>
                        </View>
                    </View>
                </Collapsible>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF"/>
                <Text style={styles.loadingText}>Carregando vendas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Consulta de Vendas</Text>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar por cliente ou código da venda..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8E8E93"
                />
            </View>

            {error && !refreshing && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Tentar Novamente" onPress={() => { setLoading(true); setSearchQuery(''); fetchData(); }} color="#FF3B30" />
                </View>
            )}

            {filteredVendas.length === 0 && !loading && !error && (
                 <View style={styles.centered}>
                    <Text style={styles.emptyListText}>
                        {searchQuery ? "Nenhuma venda encontrada para sua pesquisa." : "Nenhuma venda registrada."}
                    </Text>
                </View>
            )}

            {filteredVendas.length > 0 && (
                <FlatList
                    data={filteredVendas}
                    renderItem={renderVendaItem}
                    keyExtractor={(item) => item.codigo.toString()}
                    contentContainerStyle={styles.listContentContainer}
                    extraData={activeSections}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={["#007AFF"]}
                            tintColor={"#007AFF"}
                        />
                    }
                />
            )}
            
            <View style={styles.footerButtons}>
                <TouchableOpacity
                    style={[styles.button, styles.backButton]}
                    onPress={() => router.canGoBack() ? router.back() : null}
                >
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f6f8',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    headerText: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a202c',
        paddingVertical: 20,
        paddingTop: 40,
    },
    searchContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#f4f6f8',
    },
    searchInput: {
        height: 45,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    errorContainer: {
        margin: 20,
        padding: 15,
        backgroundColor: '#FFD2D2',
        borderRadius: 8,
        alignItems: 'center',
    },
    errorText: {
        color: '#D8000C',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyListText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    listContentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    itemHeader: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a202c',
    },
    itemSubtitle: {
        fontSize: 14,
        color: '#718096',
        marginTop: 2,
    },
    itemValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#34C759',
    },
    itemDate: {
        fontSize: 12,
        color: '#718096',
        marginTop: 4,
    },
    collapsibleContent: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: '#f4f6f8',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    detailLabel: {
        fontSize: 14,
        color: '#4a5568',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        color: '#2d3748',
        textAlign: 'right',
    },
    footerButtons: {
        padding: 15,
        paddingBottom: 25,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    backButton: {
        backgroundColor: '#6c757d',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

export default VisualizarVendas;
