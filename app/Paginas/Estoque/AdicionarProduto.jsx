import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    TouchableOpacity,
    TextInput, // TextInput é usado para quantidade
    ActivityIndicator, 
    Alert
} from 'react-native';
import {useRouter} from "expo-router";
import {Picker} from '@react-native-picker/picker';

// Espera a propriedade produtoToUpdate se um produto específico deve ser pré-selecionado pelo nome
const AdicionarEstoque = ({produtoToUpdate}) => {
    const router = useRouter();

    const [produto, setProduto] = useState(''); // Armazena o nome do produto selecionado (usará o campo 'produto' da API)
    const [codigo, setCodigo] = useState(null); // Armazena o código (inteiro ou null) do produto selecionado
    const [quantidade, setQuantidade] = useState(''); // Armazena a quantidade do produto (como string do TextInput)
    const [loading, setLoading] = useState(false); // Estado para a operação de salvar

    const [produtosList, setProdutosList] = useState([]);
    const [isLoadingInitialList, setIsLoadingInitialList] = useState(true); 

    useEffect(() => {
        const fetchProdutos = async() => {
            setIsLoadingInitialList(true); // Inicia o carregamento da lista
            try {
                const response = await fetch('https://backend-do-controle-de-estoque.onrender.com/listprodutos');
                if (!response.ok) {
                    throw new Error('Falha ao buscar produtos.');
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setProdutosList(data);
                    if (produtoToUpdate) { // Verifica se um nome de produto é fornecido para pré-selecionar
                        // Usa o campo 'produto' para encontrar o produto, conforme o JSON fornecido
                        const initialProduto = data.find(f => f.produto === produtoToUpdate); 
                        if (initialProduto) {
                            setProduto(initialProduto.produto); // Define o nome do produto usando o campo 'produto'
                            const parsedCodigo = parseInt(initialProduto.codigo, 10);
                            setCodigo(isNaN(parsedCodigo) ? null : parsedCodigo); // Define o código como inteiro
                            setQuantidade(initialProduto.quantidade ? initialProduto.quantidade.toString() : ''); // Define a quantidade
                        } else {
                            Alert.alert("Atenção", "O produto inicial não foi encontrado. Por favor, selecione um da lista.");
                            setProduto('');
                            setCodigo(null);
                            setQuantidade('');
                        }
                    } else {
                         setProduto('');
                         setCodigo(null);
                         setQuantidade('');
                    }
                } else {
                    setProdutosList([]);
                    setProduto('');
                    setCodigo(null);
                    setQuantidade('');
                }
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
                Alert.alert("Erro", error.message || "Não foi possível carregar os produtos.");
                setProdutosList([]);
                setProduto('');
                setCodigo(null);
                setQuantidade('');
            } finally {
                setIsLoadingInitialList(false); // Finaliza o carregamento da lista
            }
        };

        fetchProdutos();
    }, [produtoToUpdate]);

    const handleProdutoSelection = (selectedProdutoNome) => {
        if (selectedProdutoNome) {
            // Usa o campo 'produto' para encontrar o produto na lista, conforme o JSON fornecido
            const selectedProd = produtosList.find(f => f.produto === selectedProdutoNome); 
            if (selectedProd) {
                setProduto(selectedProd.produto); // Define o nome do produto usando o campo 'produto'
                const parsedCodigo = parseInt(selectedProd.codigo, 10);
                setCodigo(isNaN(parsedCodigo) ? null : parsedCodigo);
                setQuantidade(selectedProd.quantidade ? selectedProd.quantidade.toString() : '');
            } else {
                setProduto('');
                setCodigo(null);
                setQuantidade('');
            }
        } else {
            setProduto('');
            setCodigo(null);
            setQuantidade('');
        }
    };

    const handleSalvar = async() => {
        if (!produto) {
            Alert.alert('Erro', 'Selecione um produto para atualizar.');
            return;
        }
        if (codigo === null) { // Verifica se o código (inteiro) está presente
             Alert.alert('Erro', 'O código do produto não foi encontrado. Selecione novamente.');
             return;
        }
        const numQuantidade = Number(quantidade); // Converte quantidade para número para validação
        if (quantidade.trim() === '' || isNaN(numQuantidade) || numQuantidade < 0) {
            Alert.alert('Erro', 'A quantidade deve ser um número válido e não negativo.');
            return;
        }

        setLoading(true);

        const produtoData = {
            codigo: codigo, // Código já é um inteiro ou null (validado acima)
            produto: produto,  // Usa 'produto' como chave para o nome do produto, conforme o JSON
            quantidade: numQuantidade // Envia a quantidade como número
        };

        try {
            const response = await fetch(`https://backend-do-controle-de-estoque.onrender.com/atualizarproduto/${encodeURIComponent(String(codigo))}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produtoData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({message: 'Erro ao processar a resposta do servidor ou resposta não JSON.'}));
                Alert.alert('Erro ao Atualizar', `Falha ao atualizar quantidade do produto: ${errorData.message || response.status}`);
                return;
            }

            if (response.status === 204) {
                 Alert.alert('Sucesso', 'Quantidade do produto atualizada com sucesso!');
            } else {
                await response.json();
                Alert.alert('Sucesso', 'Quantidade do produto atualizada com sucesso!');
            }

            if (router.canGoBack()) {
                router.back();
            }
        } catch (error) {
            console.error('Erro em handleSalvar:', error);
            Alert.alert('Erro ao Atualizar', `Ocorreu um erro inesperado: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (isLoadingInitialList) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader}/>
                <Text>Carregando produtos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Atualizar Quantidade do Produto</Text>

            <Text style={styles.label}>Selecione o Produto:</Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={produto}
                    onValueChange={(itemValue) => handleProdutoSelection(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item
                        label="-- Selecione um produto --"
                        value="" // Usar string vazia para o placeholder
                        style={styles.pickerPlaceholderItem}
                    />
                    {/* Usa 'prod.produto' para label e value, conforme o JSON */}
                    {produtosList.map((prod) => (
                        <Picker.Item key={prod.codigo} label={prod.produto} value={prod.produto}/>
                    ))}
                </Picker>
            </View>

            {produto ? ( // Renderiza os campos dependentes apenas se um produto for selecionado
                <>
                    <Text style={styles.label}>Código do Produto Selecionado:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={codigo} // selectedValue pode ser null ou number
                            style={styles.picker}
                            enabled={false} // Picker inativo para exibir código
                        >
                            <Picker.Item label={codigo !== null ? codigo.toString() : "--"} value={codigo !== null ? codigo : ""} />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Quantidade em Estoque:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite a quantidade"
                        value={quantidade} // value é uma string
                        onChangeText={setQuantidade}
                        keyboardType="numeric" // Teclado numérico
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            title={loading ? "Atualizando..." : "Atualizar Quantidade"}
                            onPress={handleSalvar}
                            color="#007AFF"
                        />
                    </View>
                </>
            ) : (
                // Layout quando nenhum produto está selecionado
                <>
                    <Text style={styles.label}>Código do Produto Selecionado:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={""} style={styles.picker} enabled={false} >
                            <Picker.Item label="--" value="" />
                        </Picker>
                    </View>
                    <Text style={styles.label}>Quantidade em Estoque:</Text>
                     <TextInput
                        style={[styles.input, styles.disabledInput]} 
                        placeholder="Selecione um produto para definir a quantidade"
                        value=""
                        editable={false} // Torna o input não editável
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Atualizar Quantidade"
                            onPress={() => { Alert.alert('Atenção', 'Selecione um produto primeiro.'); }}
                            color="#007AFF"
                            disabled={true} // Botão desabilitado se nenhum produto selecionado
                        />
                    </View>
                </>
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => { if (router.canGoBack()) router.back(); }}
            >
                <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333'
    },
    label: {
        fontSize: 16,
        color: '#333',
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginBottom: 5,
        marginTop: 10
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 15,
        justifyContent: 'center'
    },
    picker: {
        width: '100%',
        height: 50,
    },
    input: { 
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 15,
        fontSize: 16,
    },
    disabledInput: { 
        backgroundColor: '#e9ecef',
        color: '#6c757d',
    },
    pickerPlaceholderItem: {
        color: '#9EA0A4'
    },
    buttonContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 20
    },
    backButton: {
        backgroundColor: '#6c757d',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 10
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
    loader: {
        marginVertical: 20
    },
    disabledButton: { 
        opacity: 0.5
    }
});

export default AdicionarEstoque;
