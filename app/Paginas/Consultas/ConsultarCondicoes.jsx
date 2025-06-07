import React, {useState, useEffect, useCallback} from 'react';
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
import {useRouter} from "expo-router";
import Collapsible from 'react-native-collapsible'; // Importar o Collapsible

// Certifique-se de instalar: npm install react-native-collapsible ou yarn add react-native-collapsible

const VisualizarCondicoesPagamento = () => {
    const router = useRouter();

    const [condicoes, setCondicoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCondicoes, setFilteredCondicoes] = useState([]);
    const [activeSections, setActiveSections] = useState([]); // Armazena os códigos dos itens expandidos

    const fetchCondicoes = async () => {
        try {
            // Endpoint para buscar condições de pagamento
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listcondicoes');
            if (!response.ok) {
                let errorMessage = `Falha ao buscar condições de pagamento. Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Mantém a mensagem de erro original se a resposta não for JSON
                }
                throw new Error(errorMessage);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setCondicoes(data);
                setFilteredCondicoes(data); // Inicializa filtrados com todas as condições
            } else {
                setCondicoes([]);
                setFilteredCondicoes([]);
                throw new Error("Os dados recebidos não são uma lista de condições de pagamento válida.");
            }
            setError(null);
        } catch (e) {
            console.error("Erro ao buscar condições de pagamento:", e);
            setError(e.message || "Não foi possível carregar as condições de pagamento. Verifique sua conexão.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchCondicoes();
    }, []);

    // Efeito para filtrar condições quando a searchQuery ou a lista original mudar
    useEffect(() => {
        if (searchQuery === '') {
            setFilteredCondicoes(condicoes);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filteredData = condicoes.filter(item => {
                const itemDescricao = item.descricao ? item.descricao.toLowerCase() : '';
                const itemCodigo = item.codigo ? item.codigo.toString().toLowerCase() : '';
                return itemDescricao.includes(lowercasedQuery) || 
                       itemCodigo.includes(lowercasedQuery);
            });
            setFilteredCondicoes(filteredData);
        }
    }, [searchQuery, condicoes]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setSearchQuery(''); // Limpa a pesquisa ao atualizar
        setError(null);
        fetchCondicoes();
    }, []);

    const toggleSection = (sectionCodigo) => {
        const newActiveSections = activeSections.includes(sectionCodigo)
            ? activeSections.filter(s => s !== sectionCodigo)
            : [...activeSections, sectionCodigo];
        setActiveSections(newActiveSections);
    };

    const renderCondicaoItem = ({item}) => {
        const isExpanded = activeSections.includes(item.codigo);

        return (
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => toggleSection(item.codigo)} style={styles.itemHeader}>
                    <Text style={styles.itemNome}>{item.descricao || "Descrição não disponível"}</Text>
                    <Text style={styles.itemHeaderIndicator}>{isExpanded ? 'Fechar' : 'Abrir'}</Text>
                </TouchableOpacity>
                <Collapsible collapsed={!isExpanded} align="center">
                    <View style={styles.collapsibleContent}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Código:</Text>
                            <Text style={styles.detailValue}>{item.codigo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Cód. Pagamento:</Text>
                            <Text style={styles.detailValue}>{item.codPagamento || "--"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Nº de Parcelas:</Text>
                            <Text style={styles.detailValue}>{item.quantidadeParcela}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Início (dias):</Text>
                            <Text style={styles.detailValue}>{item.parcelaInicial}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Intervalo (dias):</Text>
                            <Text style={styles.detailValue}>{item.intervaloParcelas}</Text>
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
                <Text style={styles.loadingText}>Carregando condições de pagamento...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Condições de Pagamento</Text>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar por descrição ou código..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8E8E93"
                />
            </View>

            {error && !refreshing && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Tentar Novamente" onPress={() => { setLoading(true); setSearchQuery(''); fetchCondicoes(); }} color="#FF3B30" />
                </View>
            )}

            {filteredCondicoes.length === 0 && !loading && !error && (
                 <View style={styles.centered}>
                    <Text style={styles.emptyListText}>
                        {searchQuery ? "Nenhuma condição encontrada para sua pesquisa." : "Nenhuma condição de pagamento cadastrada."}
                    </Text>
                </View>
            )}

            {filteredCondicoes.length > 0 && (
                <FlatList
                    data={filteredCondicoes}
                    renderItem={renderCondicaoItem}
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
        backgroundColor: '#f0f0f0',
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
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
        paddingVertical: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchInput: {
        height: 40,
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 10,
        fontSize: 16,
        color: '#000',
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
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        overflow: 'hidden',
    },
    itemHeader: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        flex: 1,
    },
    itemHeaderIndicator: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    collapsibleContent: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        paddingTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingVertical: 3,
    },
    detailLabel: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        textAlign: 'right',
    },
    ativo: {
        color: 'green',
        fontWeight: 'bold',
    },
    inativo: {
        color: 'red',
        fontWeight: 'bold',
    },
    footerButtons: {
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
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

export default VisualizarCondicoesPagamento;
