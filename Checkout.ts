import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import haversine from 'haversine-distance'
const apiKey = process.env.API_KEY

const server= express()

//tipagem para os objetos de geolocalizacao
type Location = {
  type: string | null;
  features: any[];
};

//tipagem para objetos de cada cep
type LatAndLogtype ={
   userLocation: Location,
   LojaLocation: Location
}

server.get('/checkout', async (req, res)=>{
    const origincepuser= '61618-200'
    const LocationLatAndLog: LatAndLogtype={
        userLocation: {type: null, features: []},
        LojaLocation:{type: null, features: []}
    }

    console.log('CWD:', process.cwd());
    console.log('ENV VARS:', process.env);

    //buscar geolocalizacao com base no cep
    try{
            //busca geolocalizacao de cep do usuario
            const reqgeopifyuser= await fetch(`https://api.geoapify.com/v1/geocode/search?text=${origincepuser},Caucaia,CE,Brazil&apiKey=${apiKey}`)
            //busca geolocalizacao de cep da loja
            const reqgeopifyloja= await fetch(`https://api.geoapify.com/v1/geocode/search?text=05407-002,Caucaia,CE,Brazil&apiKey=${apiKey}`)
            //recebe os resultados separadamente e arquivos json
            const datauser= await reqgeopifyuser.json()
            const dataloja= await reqgeopifyloja.json()

            //pasa os resultados para os objetos separadamente
            LocationLatAndLog.userLocation= datauser
            LocationLatAndLog.LojaLocation= dataloja
        }catch(error){
            res.send(error)
        }

    //quando os dois objetos estiverem prontos, realize a requisicao de distancia
    if(LocationLatAndLog.LojaLocation && LocationLatAndLog.userLocation){

        //acessando e definindo latitude de cada objeto
        const corduser= {lat: LocationLatAndLog.userLocation.features[0].properties.lat, lon: LocationLatAndLog.userLocation.features[0].properties.lon}
        const cordloja= {lat: LocationLatAndLog.LojaLocation.features[0].properties.lat, lon: LocationLatAndLog.LojaLocation.features[0].properties.lon}

        //realizando calculo haversine
        const distance= haversine(corduser, cordloja)

        //faz o calculo de frente com base na distancia do Ponto A a Ponto B
        if(distance){
            const calcPrice= Math.max(distance / 1000 * 300)

            //converte em modeda brasileira(real)
            const convertCoin= calcPrice.toLocaleString('pt-br',{
                style: 'currency',
                currency: 'BRL',
            })
            res.send(convertCoin)
        }
    }else{
        console.log('erro de calculo')
    }
})

const port= process.env.PORT || 3000
server.listen(port, ()=>{
    console.log('servidor rodando na porta:' + port)
})

