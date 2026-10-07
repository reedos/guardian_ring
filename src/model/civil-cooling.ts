import {carnotRefrigeratorCOP, coolerEnergyBalance} from './radiometry';

// Independent ideal refrigerator. Only the cold temperature is borrowed from
// the named TIRS-2 civil example; this does not model that instrument's cooler.
export function civilCoolingExample() {
  const coldTemperatureK=43, hotTemperatureK=300, heatRemovedW=1;
  const idealCOP=carnotRefrigeratorCOP(coldTemperatureK,hotTemperatureK);
  const minimumWorkW=heatRemovedW/idealCOP;
  return {coldTemperatureK,hotTemperatureK,heatRemovedW,idealCOP,minimumWorkW,
    rejectedHeatW:coolerEnergyBalance(heatRemovedW,minimumWorkW)};
}
