import { Stack } from "expo-router";

export default function Layout() {
    return(
    <Stack
        screenOptions = {{
            headerStyle: {
                backgroundColor: "#045785"
            },
        headerTintColor: "#fff",
        headerTitleAlign:'center'
        }}>
        <Stack.Screen name='index' options={{ title : '' }}/>
        <Stack.Screen name='Paginas/Estoque' options={{ title : 'Estoque' }}/>        
    </Stack> 
    )
}