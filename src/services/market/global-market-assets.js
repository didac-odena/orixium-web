import {
  DEFAULT_QUOTE_CURRENCY,
  getCryptoMarketSnapshots,
  refreshCryptoMarketSnapshots,
} from "./crypto-market-service.js";
import {
  getEquityMarketSnapshots,
  refreshEquityMarketSnapshots,
} from "./equity-market-service.js";
import {
  getRatesMarketSnapshots,
  refreshRatesMarketSnapshots,
} from "./rates-market-service.js";
import {
  getForexMarketSnapshots,
  refreshForexMarketSnapshots,
} from "./forex-market-service.js";
import {
  getCommoditiesMarketSnapshots,
  refreshCommoditiesMarketSnapshots,
} from "./commodities-market-service.js";

export async function loadGlobalMarketAssets(options = {}) {
  const quoteCurrency = options.quoteCurrency || DEFAULT_QUOTE_CURRENCY;
  const quoteLower = String(quoteCurrency || DEFAULT_QUOTE_CURRENCY).toLowerCase();

  let cryptoItems = getCryptoMarketSnapshots(quoteLower);
  if (!cryptoItems.length) {
    cryptoItems = await refreshCryptoMarketSnapshots(quoteLower);
  }

  let equityItems = getEquityMarketSnapshots();
  if (!equityItems.length) {
    equityItems = await refreshEquityMarketSnapshots();
  }

  let ratesItems = getRatesMarketSnapshots();
  if (!ratesItems.length) {
    ratesItems = await refreshRatesMarketSnapshots();
  }

  let forexItems = getForexMarketSnapshots();
  if (!forexItems.length) {
    forexItems = await refreshForexMarketSnapshots();
  }

  let commoditiesItems = getCommoditiesMarketSnapshots();
  if (!commoditiesItems.length) {
    commoditiesItems = await refreshCommoditiesMarketSnapshots();
  }

  return {
    crypto: cryptoItems,
    equity: equityItems,
    rates: ratesItems,
    forex: forexItems,
    commodities: commoditiesItems,
  };
}
