"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const haversine_distance_1 = __importDefault(require("haversine-distance"));
const apiKey = process.env.API_KEY;
const cors_1 = __importDefault(require("cors"));
const server = (0, express_1.default)();
server.use((0, cors_1.default)());
server.use(express_1.default.json());
server.post('/checkout', async (req, res) => {
    var _a, _b;
    const { location, state, cep } = req.body;
    console.log(req.body);
    const LocationLatAndLog = {
        userLocation: { type: null, features: [], query: null },
        LojaLocation: { type: null, features: [], query: null }
    };
    //buscar geolocalizacao com base no cep
    if (location != '' && state != '' && cep != '') {
        try {
            //busca geolocalizacao de cep do usuario
            const reqgeopifyuser = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${cep},${location},${state},Brazil&apiKey=${apiKey}`);
            //busca geolocalizacao de cep da loja
            const reqgeopifyloja = await fetch(`https://api.geoapify.com/v1/geocode/search?text=04107030,Caucaia,CE,Brazil&apiKey=${apiKey}`);
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
    }
    //quando os dois objetos estiverem prontos, realize a requisicao de distancia
    if (((_a = LocationLatAndLog.LojaLocation.query) === null || _a === void 0 ? void 0 : _a.text) != '' && ((_b = LocationLatAndLog.userLocation.query) === null || _b === void 0 ? void 0 : _b.text) != '') {
        //acessando e definindo latitude de cada objeto
        const corduser = { lat: LocationLatAndLog.userLocation.features[0].properties.lat, lon: LocationLatAndLog.userLocation.features[0].properties.lon };
        const cordloja = { lat: LocationLatAndLog.LojaLocation.features[0].properties.lat, lon: LocationLatAndLog.LojaLocation.features[0].properties.lon };
        //realizando calculo haversine
        const distance = (0, haversine_distance_1.default)(corduser, cordloja);
        //faz o calculo de frete com base na distancia do Ponto A a Ponto B
        if (distance) {
            const calcPrice = Math.max(distance / 1000 * 300);
            //converte em moeda brasileira(real)
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
server.listen(port, function () {
    console.log('servidor rodando na porta:' + port);
});
server.use((err, req, res, next) => {
    console.error('Erro interno:', err);
    res.status(500).send('Erro interno do servidor.');
});
