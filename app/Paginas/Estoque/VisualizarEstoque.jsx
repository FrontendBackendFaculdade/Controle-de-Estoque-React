import React, {useState, useEffect, useCallback} from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    // Alert, // Alert não está sendo usado diretamente para erros de fetch
    RefreshControl,
    TextInput,
    Button
} from 'react-native';
import {useRouter} from "expo-router";
import Collapsible from 'react-native-collapsible'; // Importar o Collapsible

// Certifique-se de instalar: npm install react-native-collapsible ou yarn add react-native-collapsible

const VisualizarEstoque = () => {
    const router = useRouter();

    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [activeSections, setActiveSections] = useState([]); // Armazena os códigos dos itens expandidos

    const fetchProdutos = async () => {
        try {
            const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listprodutos');
            if (!response.ok) {
                let errorMessage = `Falha ao buscar produtos. Status: ${response.status}`;
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
                setProdutos(data);
                setFilteredProdutos(data); // Inicializa filtrados com todos os produtos
            } else {
                setProdutos([]);
                setFilteredProdutos([]);
                throw new Error("Os dados recebidos não são uma lista de produtos válida.");
            }
            setError(null);
        } catch (e) {
            console.error("Erro ao buscar produtos:", e);
            setError(e.message || "Não foi possível carregar os produtos. Verifique sua conexão.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchProdutos();
    }, []);

    // Efeito para filtrar produtos quando a searchQuery ou a lista original de produtos mudar
    useEffect(() => {
        if (searchQuery === '') {
            setFilteredProdutos(produtos);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filteredData = produtos.filter(item => {
                const itemProduto = item.produto ? item.produto.toLowerCase() : '';
                const itemCodigo = item.codigo ? item.codigo.toString().toLowerCase() : '';
                return itemProduto.includes(lowercasedQuery) || itemCodigo.includes(lowercasedQuery);
            });
            setFilteredProdutos(filteredData);
        }
    }, [searchQuery, produtos]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setSearchQuery(''); // Limpa a pesquisa ao atualizar
        setError(null);
        fetchProdutos();
    }, []);

    const toggleSection = (sectionCodigo) => {
        // Alterna a seção ativa (expandida/recolhida)
        const newActiveSections = activeSections.includes(sectionCodigo)
            ? activeSections.filter(s => s !== sectionCodigo)
            : [...activeSections, sectionCodigo];
        setActiveSections(newActiveSections);
    };

    const renderProdutoItem = ({item}) => {
        const isExpanded = activeSections.includes(item.codigo);
        return (
            <View style={styles.produtoItemContainer}>
                <TouchableOpacity onPress={() => toggleSection(item.codigo)} style={styles.itemHeader}>
                    <Text style={styles.produtoNome}>{item.produto || "Nome não disponível"}</Text>
                    <Text style={styles.itemHeaderIndicator}>{isExpanded ? 'Fechar' : 'Abrir'}</Text>
                </TouchableOpacity>
                <Collapsible collapsed={!isExpanded} align="center">
                    <View style={styles.collapsibleContent}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Código:</Text>
                            <Text style={styles.detailValue}>{item.codigo}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tipo Unidade:</Text>
                            <Text style={styles.detailValue}>{item.tipoUnidade || "--"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Setor:</Text>
                            <Text style={styles.detailValue}>{item.setor || "--"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Quantidade:</Text>
                            <Text style={styles.detailValue}>{item.quantidade}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Custo Compra:</Text>
                            <Text style={styles.detailValue}>R$ {item.custoCompra || "0.00"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Margem Lucro:</Text>
                            <Text style={styles.detailValue}>{item.margemLucro || "0"}%</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Preço Venda:</Text>
                            <Text style={styles.detailValue}>R$ {item.precoDeVenda || "0.00"}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Situação:</Text>
                            <Text style={[styles.detailValue, item.ativo === "Sim" ? styles.ativo : styles.inativo]}>
                                {item.ativo === "Sim" ? "Ativo" : item.ativo === "Não" ? "Inativo" : "--"}
                            </Text>
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
                <Text style={styles.loadingText}>Carregando produtos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Lista de Produtos em Estoque</Text>
            
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar por nome ou código..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#8E8E93"
                />
            </View>

            {error && !refreshing && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Tentar Novamente" onPress={() => { setLoading(true); setSearchQuery(''); fetchProdutos(); }} color="#FF3B30" />
                </View>
            )}

            {filteredProdutos.length === 0 && !loading && !error && (
                 <View style={styles.centered}>
                    <Text style={styles.emptyListText}>
                        {searchQuery ? "Nenhum produto encontrado para sua pesquisa." : "Nenhum produto encontrado no estoque."}
                    </Text>
                </View>
            )}

            {filteredProdutos.length > 0 && (
                <FlatList
                    data={filteredProdutos} // Usa os produtos filtrados
                    renderItem={renderProdutoItem}
                    keyExtractor={(item) => item.codigo.toString()}
                    contentContainerStyle={styles.listContentContainer}
                    extraData={activeSections} // Garante re-renderização quando activeSections muda
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
    produtoItemContainer: {
        backgroundColor: '#fff',
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        overflow: 'hidden', // Para o Collapsible funcionar bem com borderRadius
    },
    itemHeader: {
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    produtoNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        flex: 1, // Permite que o nome ocupe o espaço disponível
    },
    itemHeaderIndicator: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '600',
    },
    collapsibleContent: {
        paddingHorizontal: 15,
        paddingBottom: 15, // Adiciona padding abaixo do conteúdo colapsável
        paddingTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingVertical: 3, // Aumenta um pouco o espaçamento vertical interno
    },
    detailLabel: {
        fontSize: 14,
        color: '#555',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        textAlign: 'right', // Alinha valores à direita para melhor leitura
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

export default VisualizarEstoque;
