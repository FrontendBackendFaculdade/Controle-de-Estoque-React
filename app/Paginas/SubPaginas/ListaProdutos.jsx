    import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ListaProdutos = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estoque Atual</Text>
      {/* Aqui você pode listar os produtos em estoque */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default ListaProdutos;
