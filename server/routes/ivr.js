const express = require('express');
const router = express.Router();
const db = require('../db/database');
const PricePredictionEngine = require('../services/PricePredictionEngine');
const BestSellingRouteEngine = require('../services/BestSellingRouteEngine');

/**
 * IVR Simulator API (Toll-Free 1800-AGRI-SETHU / 1800-2474-73848)
 * Generates automated voice menu dialogue and synthetic speech scripts
 * in Telugu (తెలుగు), Hindi (हिन्दी), and English.
 */

const DIALOGUES = {
  te: {
    welcome: 'నమస్కారం! అగ్రి సేతు టోల్-ఫ్రీ రైతు సహాయ కేంద్రానికి స్వాగతం. మీ పంటకు సరైన ధర మరియు గరిష్ట నికర లాభం పొందండి.',
    menuCrop: 'దయచేసి మీ పంటను ఎంచుకోండి: టమోటా కోసం 1 నొక్కండి, మిర్చి కోసం 2 నొక్కండి, పత్తి కోసం 3 నొక్కండి.',
    menuService: 'సేవను ఎంచుకోండి: ప్రస్తుత మార్కెట్ ధర కోసం 1, అత్యధిక నికర లాభం ఇచ్చే మార్కెట్ కోసం 2, పంటను ఇప్పుడే అమ్మాలా లేదా వేచి ఉండాలా అనే సలహా కోసం 3 నొక్కండి.',
    crops: { '1': 'Tomato', '2': 'Chilli', '3': 'Cotton' }
  },
  hi: {
    welcome: 'नमस्ते! एग्री सेतु टोल-फ्री किसान हेल्पलाइन में आपका स्वागत है। अपनी फसल का सही दाम और अधिकतम शुद्ध मुनाफा पाएं।',
    menuCrop: 'कृपया अपनी फसल चुनें: टमाटर के लिए 1 दबाएं, मिर्च के लिए 2 दबाएं, कपास के लिए 3 दबाएं।',
    menuService: 'सेवा चुनें: आज का मंडी भाव जानने के लिए 1, सबसे अधिक शुद्ध लाभ वाला बाजार जानने के लिए 2, फसल अभी बेचें या प्रतीक्षा करें की सलाह के लिए 3 दबाएं।',
    crops: { '1': 'Tomato', '2': 'Chilli', '3': 'Cotton' }
  },
  en: {
    welcome: 'Welcome to AgriSethu Kisan Toll-Free Advisory Helpline. Maximum Net Return from Farm to Fair Price.',
    menuCrop: 'Please select your crop: Press 1 for Tomato, Press 2 for Chilli, Press 3 for Cotton.',
    menuService: 'Select service: Press 1 for Current Spot Prices, Press 2 for Best Market & Net Return, Press 3 for Sell Now vs Wait Recommendation.',
    crops: { '1': 'Tomato', '2': 'Chilli', '3': 'Cotton' }
  }
};

router.post('/call', (req, res) => {
  const { lang = 'te', step = 1, cropChoice = '1', serviceChoice = '1' } = req.body;
  const langConfig = DIALOGUES[lang] || DIALOGUES.en;
  const cropName = langConfig.crops[cropChoice] || 'Tomato';

  // Step 1: Greeting & Language Select
  if (step === 1) {
    return res.json({
      step: 1,
      speechText: langConfig.welcome + ' ' + langConfig.menuCrop,
      displayPrompt: 'Select Crop: [1] Tomato | [2] Chilli | [3] Cotton',
      options: [
        { key: '1', label: lang === 'te' ? 'టమోటా (Tomato)' : (lang === 'hi' ? 'टमाटर (Tomato)' : 'Tomato') },
        { key: '2', label: lang === 'te' ? 'మిర్చి (Chilli)' : (lang === 'hi' ? 'मिर्च (Chilli)' : 'Chilli') },
        { key: '3', label: lang === 'te' ? 'పత్తి (Cotton)' : (lang === 'hi' ? 'कपास (Cotton)' : 'Cotton') }
      ]
    });
  }

  // Step 2: Choose Service
  if (step === 2) {
    return res.json({
      step: 2,
      cropName,
      speechText: langConfig.menuService,
      displayPrompt: `Selected: ${cropName}. Choose Service: [1] Price | [2] Best Market | [3] Sell vs Wait`,
      options: [
        { key: '1', label: lang === 'te' ? 'నేటి ధరలు (Current Price)' : (lang === 'hi' ? 'मंडी भाव (Current Price)' : 'Current Price') },
        { key: '2', label: lang === 'te' ? 'అత్యధిక లాభం ఇచ్చే మార్కెట్ (Best Market)' : (lang === 'hi' ? 'सर्वोत्तम शुद्ध लाभ बाजार (Best Net Market)' : 'Best Market & Net Return') },
        { key: '3', label: lang === 'te' ? 'ఇప్పుడే అమ్మాలా / వేచి ఉండాలా? (Sell vs Wait)' : (lang === 'hi' ? 'अभी बेचें या रुकें? (Sell vs Wait)' : 'Sell Now vs Wait Decision') }
      ]
    });
  }

  // Step 3: Provide Intelligence Response
  if (step === 3) {
    if (serviceChoice === '1') {
      // Current Prices
      const prices = db.collection('market_prices').find({ cropName }).slice(-1)[0] || { localMandiPrice: 2400, cityMandiPrice: 2650, processorPrice: 2550 };
      let speechText = '';
      if (lang === 'te') {
        speechText = `నేడు ${cropName} ధరలు: స్థానిక వరంగల్ మార్కెట్లో క్వింటాలుకు ₹${prices.localMandiPrice}, హైదరాబాద్ టెర్మినల్ మార్కెట్లో ₹${prices.cityMandiPrice}, ప్రాసెసింగ్ యూనిట్ వద్ద ₹${prices.processorPrice} గా ఉన్నాయి.`;
      } else if (lang === 'hi') {
        speechText = `आज ${cropName} का भाव: स्थानीय वारंगल मंडी में ₹${prices.localMandiPrice} प्रति क्विंटल, हैदराबाद होलसेल मंडी में ₹${prices.cityMandiPrice}, और फूड प्रोसेसिंग प्लांट में ₹${prices.processorPrice} है।`;
      } else {
        speechText = `Today's ${cropName} rates: Local Mandi is ₹${prices.localMandiPrice} per quintal, City Terminal Mandi is ₹${prices.cityMandiPrice}, and Processing Plant is ₹${prices.processorPrice}.`;
      }

      return res.json({
        step: 3,
        cropName,
        serviceChoice,
        speechText,
        data: prices
      });
    }

    if (serviceChoice === '2') {
      // Best Market & Net Return
      const routeEval = BestSellingRouteEngine.evaluateRoutes({ cropName, quantity: 20 });
      const best = routeEval.bestRoute;

      let speechText = '';
      if (lang === 'te') {
        speechText = `అగ్రి సేతు విశ్లేషణ ప్రకారం: మీ అత్యుత్తమ మార్కెట్ ${best.name}. అమ్మకపు ధర ₹${best.sellingPrice} అయినప్పటికీ, రవాణా మరియు కమీషన్ ఖర్చులు లేకపోవడం వలన మీకు లభించే గరిష్ట నికర లాభం క్వింటాలుకు ₹${best.netReturnPerQtl}.`;
      } else if (lang === 'hi') {
        speechText = `एग्री सेतु विश्लेषण: आपके लिए सबसे लाभदायक विकल्प ${best.name} है। यहां बिक्री मूल्य ₹${best.sellingPrice} है और परिवहन व दलाली खर्च शून्य होने से आपको शुद्ध मुनाफा ₹${best.netReturnPerQtl} प्रति क्विंटल मिलेगा।`;
      } else {
        speechText = `AgriSethu Recommendation: Your best selling option is ${best.name}. With zero transport deduction, your maximum net return is ₹${best.netReturnPerQtl} per quintal.`;
      }

      return res.json({
        step: 3,
        cropName,
        serviceChoice,
        speechText,
        data: best
      });
    }

    if (serviceChoice === '3') {
      // Sell Now vs Wait
      const prices = db.collection('market_prices').find({ cropName }).slice(-14).map(p => p.processorPrice || p.localMandiPrice);
      const prediction = PricePredictionEngine.evaluateSellOrWait({
        cropName,
        currentPrice: prices[prices.length - 1] || 2500,
        historicalPrices: prices,
        horizonDays: 3
      });

      let speechText = '';
      if (prediction.recommendation === 'WAIT') {
        if (lang === 'te') {
          speechText = `సలహా: 3 రోజులు వేచి ఉండండి. ధరలు పెరుగుతున్నాయి. అదనపు నిల్వ ఖర్చులు తీసివేసినా క్వింటాలుకు ₹${prediction.expectedNetGain} ఎక్కువ లాభం ఆశించవచ్చు. విశ్వసనీయత ${prediction.confidence} శాతం.`;
        } else if (lang === 'hi') {
          speechText = `सलाह: 3 दिन प्रतीक्षा करें। बाजार में तेजी का रुख है। भंडारण लागत के बाद भी आपको ₹${prediction.expectedNetGain} प्रति क्विंटल अधिक शुद्ध मुनाफा मिलेगा। विश्वसनीयता ${prediction.confidence}% है।`;
        } else {
          speechText = `Advisory: WAIT 3 DAYS. Prices show an upward trend. Expected net gain from waiting is ₹${prediction.expectedNetGain} per quintal after storage costs. Confidence: ${prediction.confidence}%.`;
        }
      } else {
        if (lang === 'te') {
          speechText = `సలహా: ఇప్పుడే అమ్మండి. మార్కెట్ ధరలు స్థిరంగా ఉన్నాయి మరియు వేచి ఉండటం వలన నిల్వ ఖర్చులు పెరుగుతాయి. విశ్వసనీయత ${prediction.confidence} శాతం.`;
        } else if (lang === 'hi') {
          speechText = `सलाह: अभी बेचें। वर्तमान भाव अनुकूल है और अधिक दिन रखने पर भंडारण खर्च बढ़ जाएगा। विश्वसनीयता ${prediction.confidence}% है।`;
        } else {
          speechText = `Advisory: SELL NOW. Current prices are favorable and further storage will incur unnecessary costs. Confidence: ${prediction.confidence}%.`;
        }
      }

      return res.json({
        step: 3,
        cropName,
        serviceChoice,
        speechText,
        data: prediction
      });
    }
  }

  res.status(400).json({ error: 'Invalid IVR step' });
});

module.exports = router;
