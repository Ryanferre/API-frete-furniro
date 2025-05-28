"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const server = (0, express_1.default)();
server.get('/checkout', async (req, res) => {
    const origincepuser = '61618-200';
    const LocationLatAndLog = {
        userLocation: { type: null, features: [] },
        LojaLocation: { type: null, features: [] }
    };
    try {
        const reqgeopifyuser = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${origincepuser},Caucaia,CE,Brazil&apiKey=2bdbaaa485ca4734af497066f9f2670a`);
        const reqgeopifyloja = await fetch(`https://api.geoapify.com/v1/geocode/search?text=05407-002,Caucaia,CE,Brazil&apiKey=2bdbaaa485ca4734af497066f9f2670a`);
        const datauser = await reqgeopifyuser.json();
        const dataloja = await reqgeopifyloja.json();
        LocationLatAndLog.userLocation = datauser;
        LocationLatAndLog.LojaLocation = dataloja;
    }
    catch (error) {
        res.send(error);
    }
    if (LocationLatAndLog.LojaLocation && LocationLatAndLog.userLocation) {
        const calcPointAPointB = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${LocationLatAndLog.userLocation.features[0].properties.lat},${LocationLatAndLog.userLocation.features[0].properties.lon}|${LocationLatAndLog.LojaLocation.features[0].properties.lat},${LocationLatAndLog.LojaLocation.features[0].properties.lon}&mode=drive&apiKey=2bdbaaa485ca4734af497066f9f2670a`);
        const rescalc = await calcPointAPointB.json();
        const distance = rescalc.features[0].properties.distance;
        if (distance) {
            const calcPrice = Math.max(distance / 1000 * 300);
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
