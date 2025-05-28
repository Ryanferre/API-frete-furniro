"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const config_1 = require("./config");
const server = (0, express_1.default)();
server.get('/checkout', async (req, res) => {
    const origincepuser = '61618-200';
    const LocationLatAndLog = {
        userLocation: { type: null, features: [] },
        LojaLocation: { type: null, features: [] }
    };
    //buscar geolocalizacao com base no cep
    try {
        //busca geolocalizacao de cep do usuario
        const reqgeopifyuser = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${origincepuser},Caucaia,CE,Brazil&apiKey=${config_1.apiKey}`);
        //busca geolocalizacao de cep da loja
        const reqgeopifyloja = await fetch(`https://api.geoapify.com/v1/geocode/search?text=05407-002,Caucaia,CE,Brazil&apiKey=${config_1.apiKey}`);
        //recebe os resultados separadamente e arquivos json
        const datauser = await reqgeopifyuser.json();
        const dataloja = await reqgeopifyloja.json();
        //pasa os resultados para os objetos separadamente
        LocationLatAndLog.userLocation = datauser;
        LocationLatAndLog.LojaLocation = dataloja;
    }
    catch (error) {
        res.send(error);
    }
    //quando os dois objetos estiverem prontos, realize a requisicao de distancia
    if (LocationLatAndLog.LojaLocation && LocationLatAndLog.userLocation) {
        //acessando e definindo latitude de cada objeto
        const corduser = { lat: LocationLatAndLog.userLocation.features[0].properties.lat, lon: LocationLatAndLog.userLocation.features[0].properties.lon };
        const cordloja = { lat: LocationLatAndLog.LojaLocation.features[0].properties.lat, lon: LocationLatAndLog.LojaLocation.features[0].properties.lon };
        //const calcPointAPointB= await fetch(`https://api.geoapify.com/v1/routing?waypoints=${LocationLatAndLog.userLocation.features[0].properties.lat},${LocationLatAndLog.userLocation.features[0].properties.lon}|${LocationLatAndLog.LojaLocation.features[0].properties.lat},${LocationLatAndLog.LojaLocation.features[0].properties.lon}&mode=drive&apiKey=2bdbaaa485ca4734af497066f9f2670a`)
        //const rescalc= await calcPointAPointB.json()
        //realizando calculo haversine
        const distance = (0, haversine_distance_1.default)(corduser, cordloja);
        //faz o calculo de frente com base na distancia do Ponto A a Ponto B
        if (distance) {
            const calcPrice = Math.max(distance / 1000 * 300);
            //converte em modeda brasileira(real)
            const convertCoin = calcPrice.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
            });
            res.send(convertCoin);
        }
    }
    else {
        console.log('erro de calculo');
    }
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('servidor rodando na porta:' + port);
});
