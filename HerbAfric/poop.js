const fs = require('fs');

function convertConditionsToJSON(textConditions) {
  const diseases = [];
  
  // First clean up the text by removing empty lines and normalizing spaces
  const cleanedText = textConditions
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\n+/g, '\n')   // Remove multiple newlines
    .trim();

  // Split into individual disease blocks (using numbers followed by dots)
  const diseaseBlocks = cleanedText.split(/(?=\n\d+\.\s)/);
  
  for (const block of diseaseBlocks) {
    // Skip empty blocks
    if (!block.trim()) continue;
    
    // Extract disease name (first line after number)
    const nameMatch = block.match(/^\d+\.\s+(.+?)(?:\n|$)/);
    if (!nameMatch) continue;
    
    const name = nameMatch[1].trim();
    const disease = {
      name,
      symptoms_and_signs: "Not specified",
      herbs: []
    };

    // Extract herbs section (more flexible matching)
    const herbsSectionMatch = block.match(/Herbs[:\s]*([\s\S]+?)(?=(?:Preparation|Symptoms|$|\n\d+\.))/i);
    if (herbsSectionMatch) {
      const herbLines = herbsSectionMatch[1].split('\n')
        .filter(line => line.trim().startsWith('•') || line.includes('–'));
      
      for (const line of herbLines) {
        // More flexible herb name extraction
        const herbMatch = line.match(/•\s*(.+?)(?:\s*–|\(|$)/) || 
                         line.match(/(.+?)\s*–/);
        if (herbMatch) {
          const herbName = herbMatch[1].trim();
          const nativeNames = {};
          
          // More flexible native name extraction
          const nameMatches = line.matchAll(/(\w+)\s*[:=]\s*([^),\n]+)/g);
          for (const match of nameMatches) {
            nativeNames[match[1]] = match[2].trim();
          }
          
          disease.herbs.push({
            name: herbName,
            native_names: Object.keys(nativeNames).length ? nativeNames : undefined,
            preparation: ""
          });
        }
      }
    }

    // Extract preparation section (more flexible matching)
    const prepSectionMatch = block.match(/Preparation[:\s]*([\s\S]+?)(?=(?:$|\n\d+\.))/i);
    if (prepSectionMatch) {
      const prepLines = prepSectionMatch[1].split('\n')
        .filter(line => line.trim().startsWith('•') || line.trim().includes('can be'));
      
      // Assign preparations to herbs
      prepLines.forEach(prepLine => {
        const prepText = prepLine.replace(/^•\s*/, '').trim();
        if (!prepText) return;
        
        // Try to match preparation to herb
        for (const herb of disease.herbs) {
          const herbBaseName = herb.name.split('(')[0].trim().toLowerCase();
          if (prepText.toLowerCase().includes(herbBaseName)) {
            herb.preparation = prepText;
            break;
          }
        }
        
        // If no specific match, assign to all herbs
        if (disease.herbs.some(h => !h.preparation)) {
          disease.herbs.forEach(herb => {
            if (!herb.preparation) herb.preparation = prepText;
          });
        }
      });
    }

    diseases.push(disease);
  }

  return { diseases };
}

// Example input text (replace with your complete conditions)
const textConditions = `
1. High Blood Pressure (Hypertension)  
Herbs:  
• Moringa (Moringa oleifera) – Zogale (Hausa), Ewe Igbale(Yoruba)  
• African Spinach (Amaranthus spp.) – Efo tete (Yoruba)  
• Hibiscus (Zobo leaves – Hibiscus sabdariffa)  
Preparation:  
• Moringa leaves can be boiled or ground into powder and added to meals.  
• Zobo drink is made by soaking dried hibiscus flowers in water with ginger.  
2. Diabetes  
Herbs:  
• Bitter Leaf (Vernonia amygdalina)  
• Mango Leaves (Mangifera indica)  
• Aloe Vera  
Preparation:  
• Boil bitter leaf or mango leaves and drink daily.  
• Aloe vera gel can be consumed raw or blended with water.  
3. Stomach Ulcers & Digestive Issues  
Herbs:  
• Utazi (Gongronema latifolium)  
• Ginger (Zingiber officinale) – Ata-ile (Yoruba)  
• Unripe Pawpaw (Carica papaya)  
Preparation:  
• Chew utazi leaves or drink as tea.  
• Ginger tea (boil fresh ginger in water).  
4. Arthritis & Joint Pain  
Herbs:  
• African Jointfir (Cissus quadrangularis) – Ewon adele(Yoruba)  
• Castor Oil Plant (Ricinus communis) – Lara (Yoruba)  
Preparation:  
• Boil Cissus quadrangularis stems and drink as tea.  
• Castor oil is massaged onto painful joints.  
5. Sickle Cell Anemia  
Herbs:  
• Sorrel Leaves (Hibiscus sabdariffa) – Zobo  
• Pawpaw Leaves (Carica papaya)  
Preparation:  
• Zobo drink helps improve blood circulation.  
• Pawpaw leaf tea is believed to reduce crises.  
 
Infectious Diseases (Viral, Bacterial, Parasitic)
1. Malaria & Fever  
Herbs:  
• Neem (Dongoyaro) – Azadirachta indica  
• Bitter Leaf (Vernonia amygdalina) – Onugbu (Igbo), Ewuro(Yoruba)  
• Mango Leaves (Mangifera indica)  
• Papaya Leaves (Carica papaya)  
Preparation:  
• Boil bitter leaf or neem leaves in water, strain, and drink the decoction.  
• Papaya leaf juice is extracted by blending and straining fresh leaves.  
2. Typhoid Fever  
Herbs:  
• Scent Leaf (Ocimum gratissimum) – Nchanwu (Igbo), Efirin (Yoruba)  
• Garlic (Allium sativum) – Ayu (Yoruba)  
• Tropical Almond (Terminalia catappa) – Fruit leaves  
Preparation:  
• Boil scent leaf with garlic and drink as tea.  
• Tropical almond leaves are boiled and taken as a tonic.  
3. Respiratory Infections (Cough, Asthma, Pneumonia)  
Herbs:  
• Eucalyptus Leaves  
• Licorice (Glycyrrhiza glabra) – Ewe omisinmisin (Yoruba)  
• Guava Leaves (Psidium guajava)  
Preparation:  
• Boil guava leaves and inhale steam for cough relief.  
• Eucalyptus oil can be used in steam inhalation.  
4. Skin Infections (Ringworm, Eczema, Wounds)  
Herbs:  
• Aloe Vera – Eti erin (Yoruba)  
• Turmeric (Curcuma longa) – Ata-ile pupa  
• Neem Leaves (Azadirachta indica)  
Preparation:  
• Apply aloe vera gel directly to wounds.  
• Turmeric paste (mix with coconut oil) for fungal infections.  
5. Sexually Transmitted Infections (STIs)  
Herbs:  
• Bitter Kola (Garcinia kola) – Orogbo (Yoruba)  
• Scent Leaf (Ocimum gratissimum)  
Preparation:  
• Chew bitter kola for antibacterial effects.  
• Drink scent leaf tea for gonorrhea relief.  
6. Cholera
Herbs:
• Guava leaves (Psidium guajava)
• Mango leaves (Mangifera indica)
• Bitter leaf (Vernonia amygdalina)
 
Preparation:
• Boil 10-15 guava leaves in 1 liter of water for 10 minutes. Drink ½ cup every 2 hours to reduce diarrhea.
• Bitter leaf juice (50ml) mixed with ORS solution helps rehydration.
7. Hepatitis B & C
Herbs:
• Phyllanthus amarus (Stonebreaker) - Eyin Olobe (Yoruba)
• Turmeric (Curcuma longa) - Ata ile pupa
• Moringa leaves (Moringa oleifera)
Preparation:
• Phyllanthus tea: Boil 10g dried plant in 500ml water for 15 mins. Drink 100ml 3x daily.
• Turmeric milk: Mix 1 tsp powder in warm milk daily.
8. HIV/AIDS Supportive Treatment
Herbs:
• Bitter kola (Garcinia kola)
• African potato (Hypoxis hemerocallidea)
• Neem leaves (Azadirachta indica)
Preparation:
• Chew 1 bitter kola nut daily to boost immunity.
• Neem leaf tea (boil 5 leaves in 2 cups water) helps with opportunistic infections.
9. Tuberculosis (TB)
Herbs:
• Garlic (Allium sativum)
• Ginger (Zingiber officinale)
• Lemon grass (Cymbopogon citratus) - Ewe tea
Preparation:
- Crush 3 garlic cloves + 1 tbsp honey. Take daily.
- Lemon grass tea (boil leaves in water) helps respiratory symptoms.
10. Lassa Fever
Herbs:
• Scent leaf (Ocimum gratissimum)
• Neem leaves
• Bitter leaf
Preparation:
• Scent leaf tea (strong infusion) helps reduce fever.
• Neem leaf bath (boil leaves for bathing water).
11. Yellow Fever/Dengue Fever
Herbs:
• Papaya leaf (Carica papaya)
• Bitter leaf
• Lemon juice with honey
Preparation:
• Papaya leaf juice (30ml daily) helps increase platelets.
• Lemon-honey water (immune booster).
12. Measles/Chickenpox
Herbs:
• Neem leaves
• Bitter leaf
• Aloe vera
Preparation:
• Neem leaf bath (boil leaves in bathing water).
• Aloe vera gel applied to skin reduces itching.
13. Rabies (Post-Exposure Support)
Herbs:
• Datura stramonium (Zakami) - CAUTION: Toxic
• Garlic
Preparation:
• ONLY under traditional healer supervision.
• Garlic paste applied to bite area (not substitute for vaccine).
14. Meningitis
Herbs:
• Garlic
• Ginger
• Eucalyptus
Preparation:
• Garlic-ginger tea (immune support).
• Eucalyptus steam inhalation.
15. Polio (Supportive)
Herbs:
• Moringa leaves
• Castor oil
Preparation:
• Moringa leaf powder (1 tsp daily in food).
• Castor oil massage for affected limbs.
16. Ebola Supportive Care
Herbs:
• Bitter kola
• Ginger
• Scent leaf
Preparation:
• Strong ginger tea (reduces nausea).
• Bitter kola chewing (antiviral properties).
17. COVID-19
Herbs:
• Ginger
• Garlic
• Turmeric
• Lemon
Preparation:
• "COVID tea": Boil ginger, garlic, lemon, turmeric in water. Sweeten with honey.
18. Zika/Monkeypox
Herbs:
• Bitter leaf
• Neem
• Aloe vera
Preparation:
• Neem leaf tea (immune support).
• Aloe vera gel for skin lesions.
19. Onchocerciasis (River Blindness)
Herbs:
• Mango bark
• Neem leaves
Preparation:
• Mango bark decoction (boil bark in water for 20 mins).
20. Schistosomiasis (Bilharzia)
Herbs:
• Pumpkin seeds
• Neem leaves
Preparation:
• Eat handful of raw pumpkin seeds daily for 2 weeks.
• Neem leaf tea.
21. Lymphatic Filariasis
Herbs:
• Pawpaw leaves
• Bitter leaf
Preparation:
• Pawpaw leaf poultice (crushed leaves on swollen limbs).
22. Tetanus
Herbs:
• Garlic
• Scent leaf
Preparation:
• Garlic paste applied to wound (after proper cleaning).
• Scent leaf poultice.
 
Respiratory diseases.
1. Pneumonia
Herbs:
• Garlic (Allium sativum) - "Ayu" (Yoruba)
• Ginger (Zingiber officinale) - "Ata-ile" (Yoruba)
• Eucalyptus leaves - "Aromado" (Yoruba)
Preparation:
• Garlic-ginger syrup: Blend equal parts garlic and ginger with honey. Take 1 tsp 3x daily
• Eucalyptus steam: Boil leaves in water, inhale steam 2x daily (cover head with towel)
• Onion compress: Roast onions, wrap in cloth, place on chest (traditional remedy)
2. Asthma
Herbs:
• African wild potato (Hypoxis hemerocallidea) - "Eru alamo" (Yoruba)
• Shea butter (Vitellaria paradoxa) - "Ori" (Yoruba)
• Camwood (Baphia nitida) - "Osun" (Yoruba)
Preparation:
• Herbal tea: Boil wild potato tubers (50g) in 1L water for 15 mins. Drink ½ cup daily
• Chest rub: Mix shea butter with camwood powder, apply to chest at night
• Avoid triggers: Keep away from dust, smoke, and cold air
3. COPD (Chronic Obstructive Pulmonary Disease)
Herbs:
• Moringa leaves (Moringa oleifera) - "Ewe igbale" (Yoruba)
• Turmeric (Curcuma longa) - "Ata-ile pupa" (Yoruba)
• Licorice root - "Ewe omisinmisin" (Yoruba)
Preparation:
• Moringa-turmeric tea: Brew 1 tsp each of dried leaves and powder in hot water
• Licorice infusion: Steep 5g dried root in hot water for 10 mins. Drink 2x daily
• Breathing exercises: Combine with pursed-lip breathing techniques
4. Bronchitis
Herbs:
• Elecampane (Inula helenium) - "Eti erin" (Yoruba)
• Thyme (Thymus vulgaris) - "Timu" (Yoruba)
• Honeycomb
Preparation:
• Expectorant syrup: Simmer elecampane root (100g) in 1L water until reduced by half. Add honey
• Thyme steam: Add fresh thyme to boiling water, inhale vapors
• Honeycomb chewing: Chew raw comb to soothe throat (adults only)
5. Sinusitis
Herbs:
• Peppermint (Mentha piperita) - "Ewe minti" (Yoruba)
• Apple cider vinegar
• Ginger
Preparation:
• Nasal rinse: Mix 1 tsp salt + ½ tsp baking soda in warm water. Use neti pot
• Peppermint-ginger tea: Brew fresh leaves with ginger slices
• Steam inhalation: Add 2 tbsp vinegar to boiling water, inhale carefully
6. Influenza (Flu)
Herbs:
• Oregano (Origanum vulgare) - "Ewe oregano" (Yoruba)
• Elderberry
• Cinnamon (Cinnamomum verum) - "Oloorun" (Yoruba)
Preparation:
• Immune booster: Steep oregano (fresh or dried) in hot water with cinnamon
• Elderberry syrup: Simmer berries with honey and ginger (1:1 ratio)
• Bed rest: Essential for recovery (minimum 3 days)
7. Common Cold (URTI)
Herbs:
• Lemongrass (Cymbopogon citratus) - "Ewe tea" (Yoruba)
• Lemon (Citrus limon) - "Orombo wewe" (Yoruba)
• Ginger
Preparation:
• Cold buster tea: Lemongrass + ginger + lemon juice + honey
• Garlic remedy: Crush 2 cloves in warm milk before bed
• Vitamin C: Increase intake of local fruits (oranges, guava)
8. Whooping Cough (Pertussis)
Herbs:
• Plantain (Plantago major) - "Ewe eje" (Yoruba)
• Wild cherry bark (Prunus serotina)
• Honey
 
Preparation:
• Cough syrup: Simmer plantain leaves (100g) in 500ml water until reduced by half. Add honey
• Bark tea: Steep wild cherry bark (5g) in hot water for cough suppression
• Humidifier: Use with eucalyptus oil for night coughing
9. Diphtheria
Herbs:
• Echinacea
• Goldenseal
• Slippery elm (Ulmus rubra)
Preparation:
• Gargle: Strong echinacea tea (cooled) for throat gargling
• Throat coat: Slippery elm lozenges or paste from powdered bark
• Critical note: Requires immediate medical attention (antitoxin)
 
General Safety Guidelines:
1. Dosage: 
• Adults: ½-1 cup herbal tea 2-3x daily
• Children: ¼ dose (consult herbalist)
2. Contraindications:
• Avoid licorice in hypertension
• Eucalyptus not for children under 6
• Honey not for infants under 1 year
3. When to seek hospital care:
• Difficulty breathing (asthma/COPD)
• High fever lasting >3 days
• Blue lips/nail beds (oxygen emergency)
4. Prevention:
• Annual flu vaccination
• Pneumococcal vaccine for at-risk groups
• Air quality management (reduce smoke exposure)
 
Gastrointestinal and liver diseases
1. Diarrheal Diseases
Herbs:
• Guava leaves (Psidium guajava) - "Gova" (Hausa)
• Mango bark (Mangifera indica) - "Ekor mango" (Yoruba)
• Pomegranate peel (Punica granatum) - "Eso ibepe" (Yoruba)
Preparation:
• Guava leaf tea: Boil 10 young leaves in 1L water for 10 mins. Drink ½ cup every 3 hours
• Mango bark decoction: Boil 50g dried bark in 1L water until reduced by half. Take 30ml 3x daily
• Oral rehydration: Combine with ORS (1L clean water + ½ tsp salt + 6 tsp sugar)
2. Dysentery (Amoebic & Bacillary)
Herbs:
• Bitter leaf (Vernonia amygdalina) - "Ewuro" (Yoruba)
• Neem (Azadirachta indica) - "Dongoyaro" (Hausa)
• Cloves (Syzygium aromaticum) - "Kanafuru" (Yoruba)
Preparation:
• Bitter leaf enema: Blend 20 leaves with warm water, strain. Use as rectal wash (adults only)
• Neem-clove tea: Steep 5 neem leaves + 5 cloves in hot water for 15 mins. Drink 2x daily
• Coconut water: Drink for electrolyte replacement
3. Gastroenteritis
Herbs:
• Ginger (Zingiber officinale) - "Ata-ile" (Yoruba)
• Mint (Mentha spp.) - "Ewe minti" (Yoruba)
• Charcoal powder
Preparation:
• Ginger-mint tea: Brew fresh ginger with peppermint leaves
• Charcoal water: Mix 1 tsp activated charcoal in water (for toxin absorption)
• BRAT diet: Bananas, Rice, Applesauce, Toast
 
4. Peptic Ulcer Disease
Herbs:
• Unripe plantain (Musa paradisiaca) - "Ogede agbagba" (Yoruba)
• Cabbage (Brassica oleracea) - "Kabeeji" (Yoruba)
• Aloe vera - "Eti erin" (Yoruba)
Preparation:
• Plantain powder: Dry and grind unripe plantains. Take 1 tbsp in warm water before meals
• Cabbage juice: Blend fresh leaves, strain. Drink 50ml 2x daily
• Aloe vera gel: 2 tbsp inner leaf gel before meals
5. Gastritis
Herbs:
• Slippery elm (Ulmus rubra)
• Chamomile (Matricaria chamomilla) - "Ramunilla" (Hausa)
• Turmeric (Curcuma longa) - "Ata-ile pupa" (Yoruba)
Preparation:
• Slippery elm gruel: Mix 1 tsp powder in warm water. Drink before meals
• Chamomile-turmeric tea: Brew together with honey
• Avoid: Spicy foods, alcohol, NSAIDs
6. Hepatitis (A, B, C, E)
Herbs:
• Phyllanthus amarus - "Eyin olobe" (Yoruba)
• Turmeric
• Milk thistle (Silybum marianum)
Preparation:
• Phyllanthus tea: Boil 10g whole plant in 500ml water for 15 mins. Drink 100ml 3x daily
• Turmeric milk: 1 tsp in warm milk at bedtime
• Liver cleanse: 1 tbsp olive oil + lemon juice each morning
 
7. Liver Cirrhosis
Herbs:
• Dandelion root (Taraxacum officinale) - "Efo yanrin" (Yoruba)
• Burdock root (Arctium lappa)
• Schisandra berries
Preparation:
• Dandelion root tea: Roast and grind roots. Brew 1 tsp per cup
• Burdock decoction: Boil chopped roots for 20 mins
• Essential: Complete alcohol abstinence
8. Appendicitis
Herbs:
• Garlic
• Ginger
• Echinacea
Preparation:
• Emergency protocol: Crush garlic + ginger, mix with honey. Take 1 tbsp hourly
• Warning: These are temporary measures only - requires immediate surgery
9. Hemorrhoids (Piles)
Herbs:
• Aloe vera
• Witch hazel (Hamamelis virginiana)
• Horse chestnut (Aesculus hippocastanum)
Preparation:
• Topical application: Chill aloe vera gel, apply to affected area
• Sitz bath: Add witch hazel extract to warm bath water
• Dietary fiber: Increase intake of whole grains, fruits
10. Food Poisoning
Herbs:
• Activated charcoal
• Garlic
• Apple cider vinegar
Preparation:
• Charcoal slurry: 1 tbsp in glass of water (for toxin binding)
• Garlic milk: Crush 3 cloves in warm milk
• Vinegar water: 2 tbsp in glass of water (kills bacteria)
 
Critical Safety Notes:
1. Medical Emergencies:
• Appendicitis requires immediate hospitalization
• Severe diarrhea with blood needs medical attention
• Jaundice with hepatitis indicates urgent care needed
2. Dosage Guidelines:
• Children: ¼-½ adult dose based on weight
• Elderly: Start with lower doses
• Pregnancy: Avoid neem, barks, strong purgatives
3. Drug Interactions:
• Phyllanthus may interact with HIV medications
• Turmeric affects blood thinners
• Charcoal reduces medication absorption
4. When to Stop Herbs:
• Worsening symptoms after 48 hours
• Signs of dehydration (sunken eyes, dry mouth)
• Blood in stool/vomit
 
Cardiovascular diseases
 
1. Hypertension (High Blood Pressure)
Herbs:
• Moringa leaves (Moringa oleifera) - "Ewe igbale" (Yoruba), "Zogale" (Hausa)
• Garlic (Allium sativum) - "Ayu" (Yoruba), "Tafarnuwa" (Hausa)
• Hibiscus (Hibiscus sabdariffa) - "Zobo" (Hausa/Yoruba)
• African eggplant leaves (Solanum macrocarpon) - "Efoigbagba" (Yoruba)
Preparation:
• Moringa tea: Steep 1 tbsp dried leaves in hot water for 10 mins. Drink 2x daily
• Garlic water: Soak 3 crushed cloves in water overnight. Drink in morning
• Zobo drink: Brew dried hibiscus calyces with ginger. Drink unsweetened
• Eggplant leaf tea: Boil fresh leaves for 5 mins. Cool and drink
Mechanism: Acts as natural ACE inhibitors, diuretics, and vasodilators
2. Stroke (Cerebrovascular Accident)
Post-Stroke Recovery Herbs:
• Ginkgo biloba - Improves cerebral circulation
• Turmeric (Curcuma longa) - "Ata ile pupa" (Yoruba) - Anti-inflammatory
• Gotu kola (Centella asiatica) - "Ewe penny" (Yoruba) - Neural repair
Preparation:
• Turmeric-ginger tea: ½ tsp turmeric + 1 tsp ginger in hot water
• Ginkgo tincture: 30 drops in water 2x daily (under supervision)
• Massage oil: Coconut oil + camphor for paralyzed limbs
Prevention: Control BP, diabetes, and cholesterol
3. Coronary Artery Disease
Herbs:
• Hawthorn (Crataegus spp.) - Cardiac tonic
• Flaxseeds - "Egberi oyinbo" (Yoruba) - Omega-3 source
• Garlic - Reduces plaque formation
Preparation:
• Hawthorn berry tea: Steep dried berries for 15 mins
• Flaxseed drink: Soak 1 tbsp overnight, blend with water
• Garlic-lemon tonic: Blend garlic + lemon + honey + ginger
Diet: Increase beans, oats, and fatty fish
4. Heart Failure
Supportive Herbs:
• Lily of the valley (Convallaria majalis) - Cardiac glycosides
• Dandelion leaf (Taraxacum officinale) - "Efo yanrin" (Yoruba) - Diuretic
• Motherwort (Leonurus cardiaca) - "Agbe dudu" (Yoruba)
Preparation:
• Dandelion salad: Eat fresh leaves daily
• Mild dandelion tea: 1 tsp dried leaves in hot water
• Salt restriction: Use herbs like scent leaf for flavoring
Caution: Monitor fluid intake and weight daily
5. Rheumatic Heart Disease
Herbs:
• Willow bark (Salix spp.) - Natural aspirin
• Celery (Apium graveolens) - "Seleri" (Yoruba) - Anti-inflammatory
• Eucalyptus - "Aromado" (Yoruba) - For respiratory symptoms
Preparation:
• Willow bark tea: Boil 1 tsp bark in water for 10 mins
• Celery juice: Blend stalks with pineapple
• Steam inhalation: Eucalyptus leaves in hot water
Critical: Requires antibiotic prophylaxis for dental procedures
General Cardiovascular Protocol
1. Dietary Changes:
• Reduce salt, oil, and processed foods
• Increase leafy greens, beans, and local fruits
• Use palm oil instead of vegetable oils
2. Lifestyle Modifications:
• Daily walking (30-60 mins)
• Stress management (deep breathing, meditation)
• Smoking cessation
3. Monitoring:
• Regular BP checks (2x weekly)
• Watch for edema (swollen feet)
• Report chest pain immediately
4. Danger Signs Requiring Hospitalization:
• Chest pain lasting >15 minutes
• Sudden severe headache
• Difficulty speaking or moving limbs
• Breathing difficulty when lying down
Safety Precautions
1. Drug Interactions:
• Garlic increases bleeding risk with warfarin
• Hawthorn may interact with digoxin
• Hibiscus enhances effects of antihypertensives
2. Contraindications:
• Avoid licorice in hypertension
• Caution with stimulants like kolanut
• Avoid grapefruit with statins
3. Dosing Guidelines:
• Start with small doses
• Monitor BP regularly
• Cycle herbs (4 weeks on, 1 week off)
 
Metabolic & Endocrine Disorders
 
1. Diabetes Mellitus (Type 2)  
Herbs:  
• Bitter Leaf (Vernonia amygdalina) – Ewuro (Yoruba), Onugbu (Igbo)  
• Mango Leaves (Mangifera indica) – Mangoro (Yoruba)  
• African Bush Mango (Irvingia gabonensis) – Ogbono (Igbo), Apon (Yoruba)  
• Aloe Vera (Eti Erin in Yoruba)  
 
Preparation & Use:  
• Bitter Leaf Juice: Blend fresh leaves, strain, and drink 50ml before meals (lowers blood sugar).  
• Mango Leaf Tea: Boil 10 dried leaves in 1L water, drink ½ cup twice daily.  
• Ogbono Seed Powder: Grind dried seeds, take 1 tsp with water daily (improves insulin sensitivity).  
• Aloe Vera Gel: Consume 1 tbsp daily (lowers fasting glucose).  
Dietary Tips:  
• Avoid refined sugar & processed carbs  
• Eat more beans, unripe plantains, and leafy greens  
• Drink fenugreek (Ewedu) water for glucose control  
2. Obesity (Weight Management)  
Herbs:  
• Garcinia kola (Bitter Kola) – Orogbo (Yoruba)  
• Ginger (Ata-ile in Yoruba, Chitta in Hausa)  
• Hibiscus (Zobo) – Yakwa (Hausa)  
Preparation & Use:  
• Bitter Kola Chewing: Chew 1-2 seeds before meals (suppresses appetite).  
• Ginger-Lemon Water: Boil ginger slices in water, add lemon juice (boosts metabolism).  
• Zobo Tea: Drink unsweetened hibiscus tea daily (reduces fat absorption).  
Lifestyle Tips:  
• Intermittent fasting (14-16hrs)  
• Exercise (30 mins walking daily)  
• Avoid palm oil excess & fried foods  
3. High Cholesterol (Hypercholesterolemia)  
Herbs:  
• Garlic (Ayu in Yoruba, Tafarnuwa in Hausa)  
• Flaxseeds (Egberi Oyinbo in Yoruba)  
• Oats (Yamuleke in Igbo)  
Preparation & Use:  
• Garlic-Honey Mix: Crush 3 cloves + 1 tbsp honey, take daily (lowers LDL).  
• Flaxseed Drink: Soak 2 tbsp overnight, blend with water (rich in omega-3).  
• Oatmeal Porridge: Eat daily (reduces cholesterol absorption).  
 
Dietary Tips:  
• Eat avocados, walnuts, and fatty fish  
• Avoid processed meats & trans fats  
4. Goiter (Iodine Deficiency)  
Herbs:  
• Seaweed (Nori) – Ewe Okun (Yoruba)  
• Coconut Water (Agua in Pidgin)  
• Pawpaw Seeds (Epe Ibepe in Yoruba)  
Preparation & Use:  
• Seaweed Soup: Add dried seaweed to soups (rich in iodine).  
• Coconut Water: Drink daily (balances electrolytes).  
• Pawpaw Seed Tea: Crush seeds, boil, and drink (supports thyroid function).  
Dietary Tips:  
• Use iodized salt  
• Eat fish, eggs, and dairy  
5. Thyroid Disorders (Hypo/Hyperthyroidism)  
Herbs:  
• Ashwagandha (Amukkara in Yoruba) – Balances thyroid hormones  
• Bladderwrack (Fucus vesiculosus) – Seaweed for iodine  
• Lemon Balm (Ewe tea in Yoruba) – For hyperthyroidism  
Preparation & Use:  
• Ashwagandha Tea: Boil 1 tsp root powder in milk (supports hypothyroidism).  
• Bladderwrack Capsules: Take 500mg daily (for iodine deficiency).  
• Lemon Balm Tea: Steep leaves in hot water (calms overactive thyroid).  
Dietary Tips:  
• Hypothyroidism: Eat Brazil nuts (selenium), pumpkin seeds (zinc)  
• Hyperthyroidism: Avoid caffeine, excess iodine  
Safety & Precautions  
• Diabetes: Monitor blood sugar to avoid hypoglycemia.  
• Thyroid Disorders: Get lab tests before using iodine-rich herbs.  
• Obesity: Avoid extreme fasting without medical advice.  
• High Cholesterol: Some herbs interact with statins (consult a doctor).  
 
Skin Diseases
 
1. Ringworm (Tinea Infections)  
Herbs:  
• Neem leaves (Azadirachta indica) – Dongoyaro (Hausa)  
• Turmeric (Ata-ile pupa in Yoruba)  
• Coconut oil (Manja in Pidgin)  
Preparation & Use:  
• Neem-Turmeric Paste: Crush fresh neem leaves with turmeric powder, apply 2x daily.  
• Coconut Oil + Garlic: Mix with crushed garlic, apply to affected area (antifungal).  
Prevention:  
- Wash clothes & bedding with hot water + neem leaves.  
2. Scabies (Itch Mite Infestation)  
Herbs:  
• Aloe vera (Eti Erin in Yoruba)  
• Bitter leaf (Vernonia amygdalina) – Onugbu (Igbo)  
• Palm kernel oil (Adin dudu in Yoruba)  
Preparation & Use:  
• Aloe + Palm Oil Mix: Apply gel mixed with palm kernel oil to soothe itching.  
• Bitter Leaf Bath: Boil leaves, add to bathwater (kills mites).  
Important:  
• Treat entire household to prevent reinfestation.  
3. Eczema (Atopic Dermatitis)  
Herbs:  
• Shea butter (Ori in Yoruba)  
• Oatmeal (Yamuleke in Igbo)  
• Chamomile (Ramunilla in Hausa)  
Preparation & Use:  
• Shea Butter + Honey: Apply as moisturizer (reduces inflammation).  
• Oatmeal Bath: Blend oats, add to lukewarm bath (relieves itching).  
Avoid:  
• Harsh soaps & synthetic fabrics.  
4. Acne Vulgaris  
Herbs:  
• Lemon juice (Orombo wewe in Yoruba)  
• Clay (Efun in Yoruba)  
• Tea tree oil (Mai tea tree in Pidgin)  
Preparation & Use:  
• Lemon-Honey Mask: Apply, leave for 10 mins (kills bacteria).  
• Clay Paste: Mix with water, apply as face mask (absorbs excess oil).  
Diet Tip:  
• Reduce dairy & sugar intake.  
5. Psoriasis (Autoimmune Skin Flaking)  
Herbs:  
• Aloe vera (Eti Erin in Yoruba)  
• Dead Sea salt (Tukun gishiri in Hausa)  
• Flaxseed oil (Egberi oyinbo in Yoruba)  
Preparation & Use:  
• Aloe Vera Gel: Apply directly to plaques (reduces scaling).  
• Salt Bath: Soak in warm water + Dead Sea salt (removes dead skin).  
Lifestyle:  
• Manage stress (triggers flare-ups).  
6. Cellulitis (Bacterial Skin Infection)  
Herbs:  
• Garlic (Ayu in Yoruba)  
• Turmeric (Ata-ile pupa in Yoruba)  
• Ginger (Ata-ile in Yoruba)  
Preparation & Use:  
• Garlic Paste: Crush & apply to affected area (natural antibiotic).  
• Turmeric Milk: Drink warm turmeric milk (boosts immunity).  
Warning:  
• If fever/swelling worsens, seek hospital care.  
7. Impetigo (Bacterial Skin Sores)  
Herbs:  
• Honey (Oyin in Yoruba)  
• Guava leaves (Gova in Hausa)  
Preparation & Use:  
• Honey Dressing: Apply raw honey to sores (heals faster).  
• Guava Leaf Wash: Boil leaves, use as antiseptic wash.  
Prevention:  
• Keep wounds clean & covered.  
8. Fungal Infections (Athlete’s Foot, Yeast)  
Herbs:  
• Apple cider vinegar (Kanmu sukari in Pidgin)  
• Pawpaw seeds (Epe ibepe in Yoruba)  
Preparation & Use:  
• Vinegar Soak: Dilute in water, soak feet (kills fungus).  
• Pawpaw Seed Paste: Crush seeds, apply to affected area.  
Prevention:  
• Keep skin dry & well-ventilated.  
9. Leprosy (Now Rare, but Traditional Remedies Exist)  
Herbs:  
• Chaulmoogra oil (Dafara in Hausa)  
• Neem oil (Mai dongoyaro in Hausa)  
Preparation & Use:  
• Oil Massage: Apply chaulmoogra oil to lesions (historical remedy).  
• Neem Leaf Tea: Boil leaves, drink daily (immune support).  
Note:  
• Modern antibiotics (MDT) are essential – herbs are supportive only.  
General Skin Care Tips  
• Hygiene: Wash with black soap (Ose dudu)  
• Moisturize: Use shea butter or coconut oil  
• Avoid Scratching: Prevents secondary infections  
 
Sexually Transmitted Infections (STIs)
1. Gonorrhea ("The Clap")  
Herbs:  
• Bitter kola (Garcinia kola) – Orogbo (Yoruba)  
• Scent leaf (Ocimum gratissimum) – Nchanwu (Igbo), Efirin(Yoruba)  
• Alum (Efun alabukun in Yoruba)  
Preparation & Use:  
• Bitter Kola Remedy: Chew 2-3 seeds daily (antibacterial properties).  
• Scent Leaf Tea: Boil leaves, drink 1 cup 2x daily (urinary tract cleanse).  
• Alum Wash: Dissolve in warm water for genital hygiene (do not overuse).  
Warning:  
• Antibiotics (e.g., Ceftriaxone) are essential – herbs are supportive only.  
2. Syphilis  
Herbs:  
• Garlic (Ayu in Yoruba, Tafarnuwa in Hausa)  
• Neem (Dongoyaro in Hausa, Ewe dogoyaro in Yoruba)  
• African peach (Nauclea latifolia) – Egbesi (Yoruba)  
Preparation & Use:  
• Garlic Therapy: Eat 3 raw cloves daily (natural antibiotic).  
• Neem Leaf Decoction: Boil leaves, drink ½ cup 2x daily (blood purifier).  
• African Peach Bark Tea: Boil bark, drink for systemic healing.  
Critical:  
• Penicillin is the primary treatment – herbs help with symptoms.  
3. Chlamydia  
Herbs:  
• Turmeric (Ata-ile pupa in Yoruba)  
• Ginger (Ata-ile in Yoruba, Chitta in Hausa)  
• Bitter leaf (Vernonia amygdalina)  
Preparation & Use:  
• Turmeric-Ginger Tea: Boil in water, drink 2x daily (anti-inflammatory).  
• Bitter Leaf Juice: Extract juice, drink 50ml daily (immune booster).  
Note:  
• Azithromycin/Doxycycline is required – herbs support recovery.  
4. Genital Herpes (HSV-2)  
Herbs:  
• Aloe vera (Eti Erin in Yoruba)  
• Lemon balm (Ewe tea in Yoruba)  
• Coconut oil (Manja in Pidgin)  
Preparation & Use:  
• Aloe Vera Gel: Apply directly to sores (speeds healing).  
• Lemon Balm Tea: Drink to reduce outbreaks.  
• Coconut Oil + Tea Tree Oil: Apply to lesions (antiviral).  
Prevention:  
• Avoid sexual contact during outbreaks.  
5. Trichomoniasis ("Trich")  
Herbs:  
• Pawpaw seeds (Epe ibepe in Yoruba)  
• Apple cider vinegar (Kanmu sukari in Pidgin)  
Preparation & Use:  
• Pawpaw Seed Water: Blend seeds, mix with water, drink (parasite killer).  
• Vinegar Douche: Dilute in water for vaginal wash (restores pH balance).  
Medical Treatment:  
• Metronidazole (Flagyl) is necessary.  
6. HPV (Genital Warts)  
Herbs:  
• Castor oil (Lara in Yoruba)  
• Fig tree latex (Ewe opoto in Yoruba)  
• Echinacea root (Mahogany herb)  
Preparation & Use:  
• Castor Oil + Baking Soda Paste: Apply to warts daily.  
• Fig Latex: Apply fresh sap to warts (caustic effect).  
Important:  
• HPV vaccine (Gardasil) prevents high-risk strains.  
General STI Management Tips  
• Abstain from sex during treatment.  
• Inform partners to prevent reinfection.  
• Boost immunity with moringa, citrus fruits, and zinc-rich foods.  
When to See a Doctor  
• If symptoms persist after 7 days of herbal treatment.  
• For HIV/STI combo testing (many STIs increase HIV risk).  
Neurological and mental health conditions
1. Epilepsy
Herbs:
• African Basil (Ocimum gratissimum) - "Efirin" (Yoruba)
• Sour Sop Leaves (Annona muricata) - "Ewe sọp sọp" (Yoruba)
• Mistletoe (Loranthus spp.) - "Afomo" (Yoruba)
Preparation:
• Basil Leaf Tea: Steep 5-7 fresh leaves in hot water for 10 minutes. Drink ½ cup twice daily
• Sour Sop Decoction: Boil 10 leaves in 1 liter water until reduced by half. Take 50ml morning and evening
• Mistletoe Infusion: Soak dried leaves in cold water overnight. Strain and drink 30ml daily
Safety:
• Always combine with prescribed anticonvulsants
• Avoid triggers like flashing lights and sleep deprivation
2. Migraine
Herbs:
• Feverfew (Tanacetum parthenium)
• Ginger (Zingiber officinale) - "Ata-ile" (Yoruba)
• Peppermint (Mentha piperita) - "Ewe minti" (Yoruba)
Preparation:
• Feverfew Tea: Brew 1 tsp dried leaves in hot water at first sign of migraine
• Ginger Compress: Apply grated ginger paste to forehead (dilute with carrier oil for sensitive skin)
• Peppermint Oil: Massage temples with 2 drops in coconut oil
Lifestyle:
• Maintain regular sleep patterns
• Identify and avoid food triggers (commonly cheese, chocolate, caffeine)
3. Alzheimer's & Dementia
Herbs:
• Gotu Kola (Centella asiatica) - "Ewe penny" (Yoruba)
• Rosemary (Rosmarinus officinalis) - "Ewe rosemary" (Yoruba)
• Turmeric (Curcuma longa) - "Ata-ile pupa" (Yoruba)
Preparation:
• Gotu Kola Tea: Steep fresh leaves in hot water. Drink 1 cup daily
• Rosemary Inhalation: Add 5 drops essential oil to diffuser daily
• Golden Milk: ½ tsp turmeric in warm milk with black pepper before bed
Cognitive Support:
• Regular mental exercises (puzzles, reading)
• Social engagement activities
• Mediterranean-style diet rich in omega-3s
4. Depression
Herbs:
• St. John's Wort (Hypericum perforatum)
• Lavender (Lavandula spp.) - "Ewe lavender" (Yoruba)
• Saffron (Crocus sativus) - "Awuje" (Yoruba)
Preparation:
• St. John's Wort Tea: 1 tsp dried herb in hot water (avoid with antidepressants)
• Lavender Bath: Add 10 drops essential oil to warm bath water
• Saffron Milk: Steep 3-5 threads in warm milk. Drink at bedtime
Important:
• Combine with sunlight exposure (30 mins daily)
• Regular exercise boosts serotonin
• Seek professional help for severe cases
5. Anxiety Disorders
Herbs:
• Passionflower (Passiflora incarnata)
• Chamomile (Matricaria chamomilla) - "Ramunilla" (Hausa)
• Lemon Balm (Melissa officinalis) - "Ewe lemon balm" (Yoruba)
Preparation:
• Passionflower Tea: Steep 1 tbsp dried herb in hot water. Drink 2-3x daily
• Chamomile-Lavender Blend: Combine equal parts for calming tea
• Lemon Balm Tincture: 30 drops in water during anxious episodes
Techniques:
• Practice 4-7-8 breathing (inhale 4s, hold 7s, exhale 8s)
• Progressive muscle relaxation
• Limit caffeine intake
6. Schizophrenia
Herbs:
• Ginkgo Biloba
• Ashwagandha (Withania somnifera) - "Amukkara" (Yoruba)
• Brahmi (Bacopa monnieri) - "Ewe brahmi" (Yoruba)
Preparation:
• Ginkgo Tea: Brew 1 tsp dried leaves in hot water (max 240mg/day)
• Ashwagandha Powder: ½ tsp in warm milk at bedtime
• Brahmi Paste: Mix powder with ghee. Take ¼ tsp morning and night
Critical Notes:
• These are adjunct therapies only
• Never discontinue prescribed antipsychotics
• Monitor for herb-drug interactions
General Neurological Health Tips:
1. Nutrition: 
• Omega-3 rich foods (walnuts, flaxseeds, fatty fish)
• B-vitamin complex (whole grains, leafy greens)
• Antioxidant-rich fruits (berries, citrus)
2. Sleep Hygiene:
• Maintain regular sleep schedule
• Dark, cool sleeping environment
• Digital detox before bedtime
3. Exercise:
• 30 minutes daily moderate activity
• Yoga and tai chi for mind-body balance
• Regular nature walks
4. Safety Precautions:
• Consult psychiatrist before combining herbs with medications
• Watch for serotonin syndrome with depression herbs
• Schizophrenia patients need consistent medical supervision
 
Joint & Musculoskeletal Disorders
 
Arthritis (Osteoarthritis & Rheumatoid Arthritis)  
Herbs:  
• Turmeric (Curcuma longa) – Ata-ile pupa (Yoruba) – Powerful anti-inflammatory  
• Ginger (Zingiber officinale) – Ata-ile (Yoruba), Chitta(Hausa) – Reduces joint swelling  
• African Jointfir (Cissus quadrangularis) – Ewon adele(Yoruba) – Bone and cartilage repair  
Preparation & Use:  
• Turmeric-Ginger Tea: Boil 1 tsp turmeric + 1 tsp ginger in 2 cups water. Drink 2x daily.  
• Jointfir Decoction: Boil stems in water for 15 mins. Drink ½ cup daily.  
• Topical Relief: Mix coconut oil + cayenne pepper as a pain-relief rub.  
Dietary Support:  
• Eat more pineapple (contains bromelain, an anti-inflammatory enzyme).  
• Avoid processed foods & excess red meat.  
2. Gout (Uric Acid Buildup)  
Herbs:  
• Bitter Leaf (Vernonia amygdalina) – Ewuro (Yoruba), Onugbu (Igbo) – Flushes uric acid  
• Celery (Apium graveolens) – Seleri (Yoruba) – Natural diuretic  
• Lemon Water (Orombo wewe in Yoruba) – Alkalizes blood  
Preparation & Use:  
• Bitter Leaf Juice: Drink 50ml daily (lowers uric acid).  
• Celery Seed Tea: Boil seeds in water, drink 2x daily.  
• Lemon Water: Squeeze 1 lemon in warm water every morning.  
Avoid:  
• Alcohol, organ meats, and sugary drinks (trigger gout attacks).  
3. Low Back Pain (Muscle & Disc Issues)  
Herbs:  
• Castor Oil (Lara in Yoruba) – Deep tissue penetration  
• Clove Oil (Kanafuru in Yoruba) – Natural painkiller  
• Yoruba "Agbo" Herbal Mix – Traditional muscle relaxant blend  
Preparation & Use:  
• Castor Oil Pack: Apply warm oil to back, cover with cloth, leave for 1 hour.  
• Clove Oil Massage: Mix 5 drops with coconut oil, massage painful areas.  
• Agbo Tea: Traditional herbal mix (consult an Onisegun for proper blend).  
Lifestyle Tips:  
• Stretch daily (cat-cow, child’s pose).  
• Sleep on a firm mattress.  
4. Sickle Cell Disease (Genetic Blood Disorder)  
Herbs:  
• Moringa (Moringa oleifera) – Ewe igbale (Yoruba), Zogale(Hausa) – Boosts hemoglobin  
• Pawpaw Leaves (Carica papaya) – Ewe ibepe (Yoruba) – Prevents crisis  
• Garlic (Ayu in Yoruba, Tafarnuwa in Hausa) – Improves circulation  
Preparation & Use:  
• Moringa Powder: 1 tsp daily in porridge or water.  
• Pawpaw Leaf Tea: Boil leaves, drink ½ cup daily (reduces sickling).  
• Garlic Therapy: Chew 2 cloves daily (improves blood flow).  
Critical Care:  
• Stay hydrated (prevents crises).  
• Avoid extreme cold & stress.  
General Pain Management Protocol  
1. Anti-inflammatory Diet  
• Eat: Turmeric, ginger, leafy greens, berries  
• Avoid: Sugar, processed foods, excess salt  
2. Topical Pain Relief  
• Shea butter + menthol (for muscle aches)  
• Hot compress with eucalyptus oil (for stiffness)  
3. Exercise & Mobility  
• Yoga (improves joint flexibility)  
• Swimming (low-impact pain relief)  
4. When to See a Doctor  
• Severe swelling, fever, or inability to move joints  
• Sickle cell crisis (extreme pain, requires hospitalization)  
Safety & Precautions  
• Arthritis/Gout: Some herbs (like turmeric) may interact with blood thinners.  
• Sickle Cell: Herbs support but cannot replace hydroxyureaor blood transfusions.  
• Back Pain: If pain radiates to legs (sciatica), seek medical imaging.  
 
Eye and ear conditions
 
1. Conjunctivitis (Pink Eye)
Herbs:
• Euphorbia hirta (Asthma plant) - "Emi-esin" (Yoruba)
• Breast milk (human)
• Aloe vera - "Eti erin" (Yoruba)
Preparation:
• Euphorbia eyewash: Crush fresh plant, mix with sterile water, strain through clean cloth. Use as eye drop 2-3x daily
• Breast milk drops: Apply 1-2 drops of fresh breast milk to affected eye (contains antibodies)
• Aloe vera wash: Mix pure gel with boiled cooled water. Use as eye rinse
Caution: Never put undiluted plant juices directly in eyes
2. Cataracts
Herbs:
• Honey (raw, unprocessed) - "Oyin" (Yoruba)
• Fennel seed (Foeniculum vulgare) - "Arosun" (Yoruba)
• Carrot juice
Preparation:
• Honey eye drops: Mix 1 part raw honey with 3 parts sterile water. Apply 1 drop 2x daily
• Fennel eyewash: Boil seeds in water, cool completely, strain. Use as eye rinse
• Dietary support: Daily intake of carrot juice with palm oil (vitamin A)
Important: These may slow progression but surgery is definitive treatment
3. Glaucoma
Herbs:
• Bilberry (Vaccinium myrtillus)
• Ginkgo biloba
• Forskolin (Coleus forskohlii)
Preparation:
• Bilberry tea: Steep dried berries in hot water. Drink 1 cup daily
• Ginkgo tincture: 30 drops in water 2x daily (improves circulation)
• Cold compress: Apply to closed eyes to relieve pressure
Warning: Never discontinue prescribed eye drops. Monitor eye pressure regularly
4. Trachoma
Herbs:
• Neem (Azadirachta indica) - "Dongoyaro" (Hausa)
• Turmeric (Curcuma longa) - "Ata-ile pupa" (Yoruba)
Preparation:
• Neem eyewash: Boil leaves, cool completely, strain. Use as eye bath
• Turmeric milk: Drink warm turmeric milk nightly (anti-inflammatory)
• Face washing: Clean face with neem soap 2x daily
Critical: Requires antibiotic treatment (azithromycin) to prevent blindness
5. Otitis Media (Ear Infection)
Herbs:
• Garlic (Allium sativum) - "Ayu" (Yoruba)
• Mullein (Verbascum thapsus)
• Onion (Allium cepa) - "Alubosa" (Yoruba)
Preparation:
• Garlic oil drops: Steep crushed garlic in olive oil 24 hours. Strain, apply 1-2 drops warm
• Mullein oil: Ready-made oil available. 2-3 drops in affected ear
• Onion poultice: Bake onion, wrap in cloth, hold near ear (not in ear canal)
Safety: Never put anything in ear if eardrum may be ruptured
6. Hearing Loss
Herbs:
• Ginkgo biloba
• Gotu kola (Centella asiatica) - "Ewe penny" (Yoruba)
• Sesame oil (Sesamum indicum) - "Eeku" (Yoruba)
Preparation:
• Ginkgo tea: 1 cup daily (improves circulation)
• Gotu kola juice: Blend fresh leaves with water. Drink 50ml daily
• Oil massage: Warm sesame oil massage around ears and neck
Types addressed: May help age-related or circulation-related hearing loss only
General Safety Guidelines:
1. Eye treatments:
• Always use sterile preparations
• Wash hands before application
• Discontinue if irritation worsens
2. Ear treatments:
• Never insert objects into ear canal
• Use oils at body temperature
• Seek help if pain persists >48 hours
3. When to see a doctor:
• Eye pain or vision changes
• Ear discharge or severe pain
• Sudden hearing loss
• No improvement after 3 days of herbal treatment
 
4. Prevention:
• Regular eye exams after age 40
• Noise protection in loud environments
• Proper face washing hygiene
 
Remedies for Neonatal & Maternal Health Conditions
 
1. Neonatal Sepsis (Newborn Infection)  
Herbs:  
• Breast milk (human) – Contains antibodies & antimicrobial properties  
• Neem (Azadirachta indica) – Dongoyaro (Hausa) – Antiseptic wash  
• Garlic (Allium sativum) – Ayu (Yoruba) – Immune-boosting (for nursing mothers)  
Preparation & Use:  
• Breast milk drops: Apply to baby’s eyes/nose (prevents infection).  
• Neem water bath: Boil leaves, cool, and use for gentle bathing (kills bacteria).  
• Garlic therapy for mothers: Chew 1-2 cloves daily (passes benefits via breast milk).  
Medical Alert:  
• Neonatal sepsis is life-threatening—requires hospital antibiotics.  
2. Birth Asphyxia (Oxygen Deprivation at Birth)  
Herbs:  
• Ginger (Zingiber officinale) – Ata-ile (Yoruba) – Stimulates circulation  
• Camphor (Kafura in Hausa) – Used in traditional resuscitation (external use only)  
Preparation & Use:  
• Ginger water: For mothers postpartum (improves blood flow).  
• Camphor rub: Tiny amount rubbed on baby’s soles (traditional revival method).  
Critical:  
• Immediate medical intervention is essential (CPR, oxygen therapy).  
3. Malnutrition (Kwashiorkor & Marasmus)  
Herbs:  
• Moringa (Moringa oleifera) – Zogale (Hausa) – High in protein & vitamins  
• Papaya (Carica papaya) – Gwanda (Hausa) – Digestive aid  
• Coconut water (Ruwan kwakwa in Hausa) – Electrolyte replenisher  
Preparation & Use:  
• Moringa leaf powder: 1 tsp in baby’s porridge (boosts nutrition).  
• Papaya mash: Ripe papaya helps digestion in weaning babies.  
• Coconut water: For rehydration in diarrhea cases.  
Dietary Recovery:  
• Kwashiorkor: High-protein foods (beans, eggs, soy).  
• Marasmus: Energy-dense foods (bananas, rice, peanut butter).  
4. Rickets (Vitamin D Deficiency)  
Herbs:  
• Sunlight exposure – Best natural Vitamin D source  
• Fluted pumpkin (Telfairia occidentalis) – Ugwu (Igbo) – Calcium-rich leaves  
• Sesame seeds (Benniseed) – Ridi (Hausa) – High in calcium  
Preparation & Use:  
• Ugwu soup: Cook leaves with crayfish (calcium-rich meal).  
• Sesame paste (Tahini): Add to baby’s food.  
Prevention:  
• 30 mins sunlight daily (before 10 AM).  
• Breastfeeding mothers should eat calcium-rich foods.  
5. Anemia (Iron Deficiency)  
Herbs:  
• Scent leaf (Ocimum gratissimum) – Efirin (Yoruba) – Iron booster  
• Liver (from goat or chicken) – Natural heme iron source  
• Sorrel (Hibiscus sabdariffa) – Yakwa (Hausa) – Vitamin C for absorption  
Preparation & Use:  
• Scent leaf tea: Boil leaves, drink (for nursing mothers).  
• Liver stew: Cook with tomatoes (enhances iron absorption).  
 
Warning:  
• Severe anemia requires iron supplements.  
6. Pre-eclampsia & Eclampsia  
Herbs:  
• Garlic (Ayu in Yoruba) – May help lower blood pressure  
• Hibiscus (Zobo) – Natural diuretic  
• Pawpaw (Carica papaya) – Gwanda (Hausa) – Rich in antioxidants  
Preparation & Use:  
• Garlic water: Crush 2 cloves in warm water (for mild hypertension).  
• Zobo tea: Unsweetened, helps reduce fluid retention.  
EMERGENCY PROTOCOL:  
• Eclampsia (seizures) requires IMMEDIATE hospitalization (IV magnesium sulfate).   
General Safety & Prevention
1. For Babies:  
• Exclusive breastfeeding for 6 months prevents infections & malnutrition.  
• Vaccinate on schedule (protects against sepsis-causing pathogens).  
2. For Mothers:  
• Prenatal care is non-negotiable (monitors pre-eclampsiarisk).  
• Eat iron-rich foods (prevent anemia during pregnancy).  
3. When to Rush to Hospital:  
• Baby: Fever, no feeding, lethargy.  
• Mother: Severe headache, blurred vision, seizures.  
Scientific Backing & Traditional Wisdom  
• WHO recommends moringa for malnutrition.  
• Garlic’s hypotensive effects are clinically studied.  
• Sunlight remains the best Vitamin D source (Nigerian Pediatrics Association).  
 
Remedies for Neglected Tropical Skin Diseases
 
1. Buruli Ulcer (Mycobacterium ulcerans Infection)  
Herbs:  
• Honey (raw, unprocessed) – Oyin (Yoruba) – Antibacterial & wound-healing  
• Neem (Azadirachta indica) – Dongoyaro (Hausa) – Antiseptic properties  
• Aloe vera – Eti Erin (Yoruba) – Promotes tissue repair  
Preparation & Use:  
• Honey Dressing: Apply raw honey directly to cleaned ulcers, cover with clean gauze (changes daily).  
• Neem Leaf Paste: Crush fresh leaves, apply to wound edges to prevent spread.  
• Aloe Vera Gel: Soothes inflamed skin around ulcers.  
Medical Alert:  
• Requires antibiotics (rifampicin + clarithromycin). Herbs are adjunct therapy only.  
2. Leishmaniasis (Sandfly-Borne Parasitic Disease)  
Herbs:  
• Black Seed (Nigella sativa) – Habbatussauda (Hausa) – Antiparasitic  
• Papaya (Carica papaya) Seeds – Epe Ibepe (Yoruba) – Kills parasites  
• Turmeric (Curcuma longa) – Ata-ile pupa (Yoruba) – Reduces inflammation  
Preparation & Use:  
• Black Seed Oil: Take 1 tsp daily (immune support).  
• Papaya Seed Paste: Crush seeds, mix with honey, take ½ tspdaily (not for pregnant women).  
• Turmeric Compress: Mix powder with coconut oil, apply to skin lesions.  
Prevention:  
• Sleep under insecticide-treated nets (sandflies bite at night).  
3. Mycetoma (Chronic Fungal/Bacterial Infection)  
Herbs:  
• Garlic (Allium sativum) – Ayu (Yoruba) – Antifungal/antibacterial  
• Apple Cider Vinegar – Kanmu sukari (Pidgin) – Acidic wound cleanser  
• Guava Leaves (Psidium guajava) – Gova (Hausa) – Antiseptic  
 
Preparation & Use:  
• Garlic Poultice: Crush cloves, mix with coconut oil, applyto affected area.  
• Vinegar Soak: Dilute 1:1 with water, soak infected foot/hand 20 mins daily.  
• Guava Leaf Wash: Boil leaves, use cooled water to clean wounds.  
Critical Note:  
• Advanced mycetoma requires surgery + long-term antifungals/antibiotics.  
 
General Wound Care Protocol
1. Cleaning:  
• Wash with boiled & cooled salt water or neem water.  
2. Dressing:  
• Use sterile gauze + honey or aloe vera.  
3. Prevent Spread:  
• Avoid walking barefoot (mycetoma).  
• Cover ulcers to prevent fly infestation (Buruli ulcer).  
When to Seek Hospital Care  
• Fever with worsening wounds  
• Blackened skin (necrosis)  
• No improvement after 2 weeks of herbal care  
 
General Preparation Methods
1. Decoction – Boiling herbs in water to extract active compounds.  
2. Infusion – Steeping herbs in hot water (like tea).  
3. Poultice – Crushing herbs into a paste for topical application.  
4. Juicing – Extracting liquid from fresh leaves (e.g., bitter leaf juice).  
 
Safety Notes:
• Some herbs can interact with medications (e.g., garlic with blood thinners).  
• Always consult a herbalist or doctor before long-term use.  
• These remedies are primarily SUPPORTIVE and should not replace medical treatment for serious diseases.
• Some herbs (like Datura) can be toxic - use only under expert guidance.
• Always combine with proper hygiene and sanitation practices.
• For vaccine-preventable diseases (polio, measles, tetanus), vaccination remains essential.
`;

// Convert and write to file
try {
  const jsonOutput = convertConditionsToJSON(textConditions);
  
  if (jsonOutput?.diseases?.length > 0) {
    fs.writeFileSync('conditions.json', JSON.stringify(jsonOutput, null, 2));
    console.log('Successfully created conditions.json with', jsonOutput.diseases.length, 'diseases');
    console.log('Sample output:', JSON.stringify(jsonOutput.diseases[0], null, 2));
  } else {
    console.error('Error: No valid diseases were parsed. Check your input format.');
    console.log('Input sample:', textConditions.substring(0, 200), '...');
  }
} catch (err) {
  console.error('Error:', err);
}

