'use strict';
/**
 * Reborn / Rejuvenation / Desolation custom Dex extensions:
 *   - 4 Field Seeds (Elemental, Magical, Synthetic, Telluric) + Amplifield Rock
 *   - 50+ Rejuvenation & Desolation Pokémon Crests with battle callbacks
 *   - Aevian Regional Forms, Rift Boss Forms & Custom Mega Evolutions
 *   - Custom signature moves & abilities
 */
const {Dex, toID} = require('pokemon-showdown');

const CUSTOM_SPECIES = {"cinccinomega":{"num":573,"name":"Cinccino-Mega","baseSpecies":"Cinccino","forme":"Mega","types":["Normal","Fairy"],"baseStats":{"hp":75,"atk":125,"def":110,"spa":40,"spd":80,"spe":135},"abilities":{"0":"Skill Link"},"weightkg":7.5,"heightm":0.5,"requiredItem":"Cinccinite","isMega":true,"spriteid":"cinccino"},"luxraymega":{"num":405,"name":"Luxray-Mega","baseSpecies":"Luxray","forme":"Mega","types":["Electric"],"baseStats":{"hp":80,"atk":145,"def":99,"spa":95,"spd":79,"spe":125},"abilities":{"0":"Strong Jaw"},"weightkg":42,"heightm":1.4,"requiredItem":"Luxrite","isMega":true,"spriteid":"luxray"},"mightyenamega":{"num":262,"name":"Mightyena-Mega","baseSpecies":"Mightyena","forme":"Mega","types":["Dark","Ghost"],"baseStats":{"hp":70,"atk":125,"def":70,"spa":60,"spd":70,"spe":125},"abilities":{"0":"Intimidate"},"weightkg":37,"heightm":1,"requiredItem":"Mightyenite","isMega":true,"spriteid":"mightyena"},"toxicroakmega":{"num":454,"name":"Toxicroak-Mega","baseSpecies":"Toxicroak","forme":"Mega","types":["Poison","Fighting"],"baseStats":{"hp":83,"atk":136,"def":70,"spa":116,"spd":70,"spe":115},"abilities":{"0":"Adaptability"},"weightkg":44.4,"heightm":1.3,"requiredItem":"Toxicroakite","isMega":true,"spriteid":"toxicroak"},"umbreonperfect":{"num":197,"name":"Umbreon-Perfect","baseSpecies":"Umbreon","forme":"Perfect","types":["Dark","Psychic"],"baseStats":{"hp":95,"atk":65,"def":150,"spa":130,"spd":160,"spe":75},"abilities":{"0":"Magic Bounce"},"weightkg":270,"heightm":1,"spriteid":"umbreon"},"gothitellecrescent":{"num":576,"name":"Gothitelle-Crescent","baseSpecies":"Gothitelle","forme":"Crescent","types":["Psychic"],"baseStats":{"hp":95,"atk":35,"def":108,"spa":115,"spd":118,"spe":90},"abilities":{"0":"Frisk"},"weightkg":97,"heightm":1.5,"spriteid":"gothitelle"},"parasaevian":{"num":46,"name":"Paras-Aevian","baseSpecies":"Paras","forme":"Aevian","types":["Bug","Poison"],"baseStats":{"hp":35,"atk":70,"def":55,"spa":45,"spd":55,"spe":25},"abilities":{"0":"Resuscitation"},"weightkg":5.4,"heightm":0.3,"spriteid":"paras"},"parasaevianz":{"num":46,"name":"Paras-Aevian-Z","baseSpecies":"Paras","forme":"Aevian-Z","types":["Ghost","Poison"],"baseStats":{"hp":15,"atk":100,"def":25,"spa":45,"spd":25,"spe":75},"abilities":{"0":"Resuscitation"},"weightkg":5.4,"heightm":0.3,"spriteid":"paras"},"parasectaevian":{"num":47,"name":"Parasect-Aevian","baseSpecies":"Parasect","forme":"Aevian","types":["Bug","Poison"],"baseStats":{"hp":60,"atk":90,"def":80,"spa":60,"spd":80,"spe":30},"abilities":{"0":"Resuscitation"},"weightkg":29.5,"heightm":1,"spriteid":"parasect"},"parasectaevianz":{"num":47,"name":"Parasect-Aevian-Z","baseSpecies":"Parasect","forme":"Aevian-Z","types":["Ghost","Poison"],"baseStats":{"hp":40,"atk":130,"def":40,"spa":50,"spd":40,"spe":105},"abilities":{"0":"Resuscitation"},"weightkg":29.5,"heightm":1,"spriteid":"parasect"},"magikarpaevian":{"num":129,"name":"Magikarp-Aevian","baseSpecies":"Magikarp","forme":"Aevian","types":["Fire"],"baseStats":{"hp":20,"atk":10,"def":55,"spa":15,"spd":20,"spe":80},"abilities":{"0":"Rattled"},"weightkg":10,"heightm":0.9,"spriteid":"magikarp"},"gyaradosaevian":{"num":130,"name":"Gyarados-Aevian","baseSpecies":"Gyarados","forme":"Aevian","types":["Fire","Dragon"],"baseStats":{"hp":95,"atk":60,"def":79,"spa":125,"spd":100,"spe":81},"abilities":{"0":"Intimidate"},"weightkg":235,"heightm":6.5,"spriteid":"gyarados"},"gyaradosam":{"num":130,"name":"Gyarados-Am","baseSpecies":"Gyarados","forme":"Am","types":["Steel"],"baseStats":{"hp":120,"atk":110,"def":100,"spa":100,"spd":130,"spe":81},"abilities":{"0":"Liquid Voice"},"weightkg":906,"heightm":6.5,"spriteid":"gyarados"},"gyaradosrift":{"num":130,"name":"Gyarados-Rift","baseSpecies":"Gyarados","forme":"Rift","types":["Water","Ghost"],"baseStats":{"hp":95,"atk":125,"def":89,"spa":90,"spd":110,"spe":81},"abilities":{"0":"Intimidate"},"weightkg":306,"heightm":6.5,"spriteid":"gyarados"},"gyaradosriftsb1":{"num":130,"name":"Gyarados-RiftSB1","baseSpecies":"Gyarados","forme":"RiftSB1","types":["Water","Dragon"],"baseStats":{"hp":95,"atk":125,"def":89,"spa":90,"spd":110,"spe":81},"abilities":{"0":"Intimidate"},"weightkg":306,"heightm":6.5,"spriteid":"gyarados"},"gyaradosriftsb2":{"num":130,"name":"Gyarados-RiftSB2","baseSpecies":"Gyarados","forme":"RiftSB2","types":["Fire","Dragon"],"baseStats":{"hp":95,"atk":125,"def":89,"spa":90,"spd":110,"spe":81},"abilities":{"0":"Intimidate"},"weightkg":306,"heightm":6.5,"spriteid":"gyarados"},"laprasaevian":{"num":131,"name":"Lapras-Aevian","baseSpecies":"Lapras","forme":"Aevian","types":["Rock","Psychic"],"baseStats":{"hp":135,"atk":95,"def":80,"spa":85,"spd":85,"spe":60},"abilities":{"0":"Solid Rock"},"weightkg":220,"heightm":2.5,"spriteid":"lapras"},"mareepaevian":{"num":179,"name":"Mareep-Aevian","baseSpecies":"Mareep","forme":"Aevian","types":["Ice","Electric"],"baseStats":{"hp":55,"atk":40,"def":45,"spa":65,"spd":40,"spe":35},"abilities":{"0":"Filter"},"weightkg":7.8,"heightm":0.6,"spriteid":"mareep"},"flaafyaevian":{"num":180,"name":"Flaaffy-Aevian","baseSpecies":"Flaaffy","forme":"Aevian","types":["Ice","Electric"],"baseStats":{"hp":70,"atk":55,"def":60,"spa":80,"spd":50,"spe":45},"abilities":{"0":"Filter"},"weightkg":13.3,"heightm":0.8,"spriteid":"flaaffy"},"flaaffyaevian":{"num":180,"name":"Flaaffy-Aevian","baseSpecies":"Flaaffy","forme":"Aevian","types":["Ice","Electric"],"baseStats":{"hp":70,"atk":55,"def":60,"spa":80,"spd":50,"spe":45},"abilities":{"0":"Filter"},"weightkg":13.3,"heightm":0.8,"spriteid":"flaaffy"},"ampharosaevian":{"num":181,"name":"Ampharos-Aevian","baseSpecies":"Ampharos","forme":"Aevian","types":["Ice","Electric"],"baseStats":{"hp":90,"atk":75,"def":90,"spa":115,"spd":85,"spe":55},"abilities":{"0":"Filter"},"weightkg":61.5,"heightm":1.4,"spriteid":"ampharos"},"misdreavusaevian":{"num":200,"name":"Misdreavus-Aevian","baseSpecies":"Misdreavus","forme":"Aevian","types":["Grass","Ghost"],"baseStats":{"hp":60,"atk":85,"def":60,"spa":85,"spd":60,"spe":85},"abilities":{"0":"Magic Bounce"},"weightkg":1,"heightm":0.7,"spriteid":"misdreavus"},"shroomishaevian":{"num":285,"name":"Shroomish-Aevian","baseSpecies":"Shroomish","forme":"Aevian","types":["Grass"],"baseStats":{"hp":60,"atk":40,"def":60,"spa":40,"spd":60,"spe":35},"abilities":{"0":"Rattled"},"weightkg":4.5,"heightm":0.4,"spriteid":"shroomish"},"breloomaevian":{"num":286,"name":"Breloom-Aevian","baseSpecies":"Breloom","forme":"Aevian","types":["Grass","Electric"],"baseStats":{"hp":60,"atk":130,"def":80,"spa":60,"spd":60,"spe":70},"abilities":{"0":"Rattled"},"weightkg":39.2,"heightm":1.2,"spriteid":"breloom"},"roseliaaevian":{"num":315,"name":"Roselia-Aevian","baseSpecies":"Roselia","forme":"Aevian","types":["Ground","Fighting"],"baseStats":{"hp":50,"atk":60,"def":45,"spa":100,"spd":80,"spe":65},"abilities":{"0":"Dry Skin"},"weightkg":2,"heightm":0.3,"spriteid":"roselia"},"feebasaevian":{"num":349,"name":"Feebas-Aevian","baseSpecies":"Feebas","forme":"Aevian","types":["Poison","Fairy"],"baseStats":{"hp":20,"atk":15,"def":20,"spa":10,"spd":55,"spe":80},"abilities":{"0":"Poison Point"},"weightkg":7.4,"heightm":0.6,"spriteid":"feebas"},"miloticaevian":{"num":350,"name":"Milotic-Aevian","baseSpecies":"Milotic","forme":"Aevian","types":["Poison","Fairy"],"baseStats":{"hp":95,"atk":100,"def":79,"spa":60,"spd":125,"spe":81},"abilities":{"0":"Poison Point"},"weightkg":162,"heightm":6.2,"spriteid":"milotic"},"snoruntaevian":{"num":361,"name":"Snorunt-Aevian","baseSpecies":"Snorunt","forme":"Aevian","types":["Grass","Rock"],"baseStats":{"hp":50,"atk":50,"def":50,"spa":50,"spd":50,"spe":50},"abilities":{"0":"Grass Pelt"},"weightkg":16.8,"heightm":0.7,"spriteid":"snorunt"},"glalieaevian":{"num":362,"name":"Glalie-Aevian","baseSpecies":"Glalie","forme":"Aevian","types":["Grass","Rock"],"baseStats":{"hp":110,"atk":100,"def":90,"spa":50,"spd":80,"spe":50},"abilities":{"0":"Grassy Surge"},"weightkg":256.5,"heightm":1.5,"spriteid":"glalie"},"budewaevian":{"num":406,"name":"Budew-Aevian","baseSpecies":"Budew","forme":"Aevian","types":["Ground"],"baseStats":{"hp":40,"atk":30,"def":35,"spa":50,"spd":70,"spe":55},"abilities":{"0":"Dry Skin"},"weightkg":1.2,"heightm":0.2,"spriteid":"budew"},"roseradeaevian":{"num":407,"name":"Roserade-Aevian","baseSpecies":"Roserade","forme":"Aevian","types":["Ground","Fighting"],"baseStats":{"hp":60,"atk":70,"def":65,"spa":125,"spd":105,"spe":90},"abilities":{"0":"Dry Skin"},"weightkg":14.5,"heightm":0.9,"spriteid":"roserade"},"mismagiusaevian":{"num":429,"name":"Mismagius-Aevian","baseSpecies":"Mismagius","forme":"Aevian","types":["Grass","Ghost"],"baseStats":{"hp":60,"atk":105,"def":60,"spa":105,"spd":60,"spe":105},"abilities":{"0":"Magic Bounce"},"weightkg":4.4,"heightm":0.9,"spriteid":"mismagius"},"bronzoraevian":{"num":436,"name":"Bronzor-Aevian","baseSpecies":"Bronzor","forme":"Aevian","types":["Steel"],"baseStats":{"hp":57,"atk":24,"def":86,"spa":24,"spd":86,"spe":23},"abilities":{"0":"Reflector"},"weightkg":60.5,"heightm":0.5,"spriteid":"bronzor"},"bronzongaevian":{"num":437,"name":"Bronzong-Aevian","baseSpecies":"Bronzong","forme":"Aevian","types":["Steel"],"baseStats":{"hp":67,"atk":79,"def":116,"spa":89,"spd":116,"spe":33},"abilities":{"0":"Reflector"},"weightkg":187,"heightm":1.3,"spriteid":"bronzong"},"froslassaevian":{"num":478,"name":"Froslass-Aevian","baseSpecies":"Froslass","forme":"Aevian","types":["Grass","Water"],"baseStats":{"hp":70,"atk":80,"def":70,"spa":80,"spd":70,"spe":110},"abilities":{"0":"Adaptability"},"weightkg":26.6,"heightm":1.3,"spriteid":"froslass"},"froslassrift":{"num":478,"name":"Froslass-Rift","baseSpecies":"Froslass","forme":"Rift","types":["Electric","Fairy"],"baseStats":{"hp":97,"atk":66,"def":166,"spa":123,"spd":148,"spe":66},"abilities":{"0":"Temporal Shift"},"weightkg":10,"heightm":1.3,"spriteid":"froslass"},"munnaaevian":{"num":517,"name":"Munna-Aevian","baseSpecies":"Munna","forme":"Aevian","types":["Dark","Fairy"],"baseStats":{"hp":76,"atk":67,"def":45,"spa":25,"spd":45,"spe":24},"abilities":{"0":"Bad Dreams"},"weightkg":23.3,"heightm":0.6,"spriteid":"munna"},"musharnaaevian":{"num":518,"name":"Musharna-Aevian","baseSpecies":"Musharna","forme":"Aevian","types":["Dark","Fairy"],"baseStats":{"hp":116,"atk":107,"def":85,"spa":65,"spd":85,"spe":29},"abilities":{"0":"Bad Dreams"},"weightkg":60.5,"heightm":1.1,"spriteid":"musharna"},"musharnapulse":{"num":518,"name":"Musharna-Pulse","baseSpecies":"Musharna","forme":"Pulse","types":["Psychic","Fairy"],"baseStats":{"hp":141,"atk":55,"def":95,"spa":127,"spd":115,"spe":29},"abilities":{"0":"Pastel Veil"},"weightkg":60.5,"heightm":1.1,"spriteid":"musharna"},"sewaddleaevian":{"num":540,"name":"Sewaddle-Aevian","baseSpecies":"Sewaddle","forme":"Aevian","types":["Dragon","Bug"],"baseStats":{"hp":45,"atk":63,"def":65,"spa":40,"spd":55,"spe":42},"abilities":{"0":"Swarm"},"weightkg":2.5,"heightm":0.3,"spriteid":"sewaddle"},"swadloonaevian":{"num":541,"name":"Swadloon-Aevian","baseSpecies":"Swadloon","forme":"Aevian","types":["Dragon","Bug"],"baseStats":{"hp":55,"atk":73,"def":85,"spa":50,"spd":75,"spe":42},"abilities":{"0":"Swarm"},"weightkg":7.3,"heightm":0.5,"spriteid":"swadloon"},"leavannyaevian":{"num":542,"name":"Leavanny-Aevian","baseSpecies":"Leavanny","forme":"Aevian","types":["Dragon","Bug"],"baseStats":{"hp":75,"atk":108,"def":75,"spa":70,"spd":75,"spe":97},"abilities":{"0":"Swarm"},"weightkg":20.5,"heightm":1.2,"spriteid":"leavanny"},"sigilyphaevian":{"num":561,"name":"Sigilyph-Aevian","baseSpecies":"Sigilyph","forme":"Aevian","types":["Fairy","Ghost"],"baseStats":{"hp":72,"atk":58,"def":80,"spa":103,"spd":80,"spe":97},"abilities":{"0":"Flare Boost"},"weightkg":14,"heightm":1.4,"spriteid":"sigilyph"},"sigilypham":{"num":561,"name":"Sigilyph-Am","baseSpecies":"Sigilyph","forme":"Am","types":["Steel","Flying"],"baseStats":{"hp":80,"atk":50,"def":70,"spa":130,"spd":90,"spe":80},"abilities":{"0":"Aftermath"},"weightkg":14,"heightm":1.4,"spriteid":"sigilyph"},"litwickaevian":{"num":607,"name":"Litwick-Aevian","baseSpecies":"Litwick","forme":"Aevian","types":["Ghost","Fire"],"baseStats":{"hp":50,"atk":35,"def":55,"spa":65,"spd":55,"spe":20},"abilities":{"0":"Illuminate"},"weightkg":3.1,"heightm":0.3,"spriteid":"litwick"},"lampentaevian":{"num":608,"name":"Lampent-Aevian","baseSpecies":"Lampent","forme":"Aevian","types":["Ghost","Electric"],"baseStats":{"hp":60,"atk":40,"def":60,"spa":95,"spd":60,"spe":55},"abilities":{"0":"Illuminate"},"weightkg":13,"heightm":0.6,"spriteid":"lampent"},"chandelureaevian":{"num":609,"name":"Chandelure-Aevian","baseSpecies":"Chandelure","forme":"Aevian","types":["Ghost","Fire"],"baseStats":{"hp":65,"atk":55,"def":90,"spa":145,"spd":90,"spe":80},"abilities":{"0":"Illuminate"},"weightkg":34.3,"heightm":1,"spriteid":"chandelure"},"chandelurerift":{"num":609,"name":"Chandelure-Rift","baseSpecies":"Chandelure","forme":"Rift","types":["Ghost","Fire"],"baseStats":{"hp":99,"atk":29,"def":69,"spa":179,"spd":119,"spe":99},"abilities":{"0":"Trace"},"weightkg":101.1,"heightm":1,"spriteid":"chandelure"},"chandelurerift2":{"num":609,"name":"Chandelure-Rift2","baseSpecies":"Chandelure","forme":"Rift2","types":["Ghost","Water"],"baseStats":{"hp":99,"atk":29,"def":69,"spa":179,"spd":119,"spe":99},"abilities":{"0":"Trace"},"weightkg":101.1,"heightm":1,"spriteid":"chandelure"},"chandelurerift3":{"num":609,"name":"Chandelure-Rift3","baseSpecies":"Chandelure","forme":"Rift3","types":["Ghost","Grass"],"baseStats":{"hp":99,"atk":29,"def":69,"spa":179,"spd":119,"spe":99},"abilities":{"0":"Trace"},"weightkg":101.1,"heightm":1,"spriteid":"chandelure"},"chandelurerift4":{"num":609,"name":"Chandelure-Rift4","baseSpecies":"Chandelure","forme":"Rift4","types":["Ghost","Electric"],"baseStats":{"hp":99,"atk":29,"def":69,"spa":179,"spd":119,"spe":99},"abilities":{"0":"Trace"},"weightkg":101.1,"heightm":1,"spriteid":"chandelure"},"larvestaaevian":{"num":636,"name":"Larvesta-Aevian","baseSpecies":"Larvesta","forme":"Aevian","types":["Flying"],"baseStats":{"hp":55,"atk":85,"def":50,"spa":50,"spd":50,"spe":70},"abilities":{"0":"Wonder Skin"},"weightkg":28.8,"heightm":1.1,"spriteid":"larvesta"},"volcaronaaevian":{"num":637,"name":"Volcarona-Aevian","baseSpecies":"Volcarona","forme":"Aevian","types":["Flying"],"baseStats":{"hp":85,"atk":60,"def":60,"spa":135,"spd":100,"spe":110},"abilities":{"0":"Shield Dust"},"weightkg":46,"heightm":1.6,"spriteid":"volcarona"},"wimpodaevian":{"num":767,"name":"Wimpod-Aevian","baseSpecies":"Wimpod","forme":"Aevian","types":["Ground"],"baseStats":{"hp":25,"atk":40,"def":35,"spa":15,"spd":35,"spe":80},"abilities":{"0":"Wimp Out"},"weightkg":12,"heightm":0.5,"spriteid":"wimpod"},"golisopodaevian":{"num":768,"name":"Golisopod-Aevian","baseSpecies":"Golisopod","forme":"Aevian","types":["Ground"],"baseStats":{"hp":75,"atk":125,"def":130,"spa":50,"spd":100,"spe":50},"abilities":{"0":"Battle Armor"},"weightkg":108,"heightm":2,"spriteid":"golisopod"},"jangmooaevian":{"num":-1000,"name":"Jangmo-o-Aevian","types":["Dragon","Poison"],"baseStats":{"hp":50,"atk":65,"def":55,"spa":40,"spd":40,"spe":40},"abilities":{"0":"Analytic"},"weightkg":29.7,"heightm":1.2},"hakamooaevian":{"num":-1000,"name":"Hakamo-o-Aevian","types":["Dragon","Poison"],"baseStats":{"hp":70,"atk":85,"def":85,"spa":60,"spd":60,"spe":60},"abilities":{"0":"Analytic"},"weightkg":47,"heightm":1.2},"kommooaevian":{"num":784,"name":"Kommo-o-Aevian","baseSpecies":"Kommo-o","forme":"o-Aevian","types":["Dragon","Poison"],"baseStats":{"hp":95,"atk":125,"def":125,"spa":95,"spd":95,"spe":65},"abilities":{"0":"Analytic"},"weightkg":78.2,"heightm":1.6,"spriteid":"kommoo"},"toxtricityaevian":{"num":849,"name":"Toxtricity-Aevian","baseSpecies":"Toxtricity","forme":"Aevian","types":["Fire","Poison"],"baseStats":{"hp":70,"atk":75,"def":70,"spa":114,"spd":70,"spe":98},"abilities":{"0":"Galvanize"},"weightkg":40,"heightm":1.6,"spriteid":"toxtricity"},"magnetonam":{"num":82,"name":"Magneton-Am","baseSpecies":"Magneton","forme":"Am","types":["Electric","Steel"],"baseStats":{"hp":80,"atk":1,"def":90,"spa":130,"spd":120,"spe":40},"abilities":{"0":"Adaptability"},"weightkg":60,"heightm":1,"spriteid":"magneton"},"laironam":{"num":305,"name":"Lairon-Am","baseSpecies":"Lairon","forme":"Am","types":["Steel"],"baseStats":{"hp":80,"atk":110,"def":90,"spa":70,"spd":70,"spe":140},"abilities":{"0":"Strong Jaw"},"weightkg":750,"heightm":0.9,"spriteid":"lairon"},"laironamrusty":{"num":305,"name":"Lairon-Am Rusty","baseSpecies":"Lairon","forme":"Am Rusty","types":["Steel"],"baseStats":{"hp":80,"atk":100,"def":90,"spa":70,"spd":70,"spe":60},"abilities":{"0":"Weak Armor"},"weightkg":750,"heightm":0.9,"spriteid":"lairon"},"claydolam":{"num":344,"name":"Claydol-Am","baseSpecies":"Claydol","forme":"Am","types":["Steel","Psychic"],"baseStats":{"hp":120,"atk":1,"def":140,"spa":70,"spd":140,"spe":50},"abilities":{"0":"Aftermath"},"weightkg":108,"heightm":1.5,"spriteid":"claydol"},"metangam":{"num":375,"name":"Metang-Am","baseSpecies":"Metang","forme":"Am","types":["Steel","Psychic"],"baseStats":{"hp":80,"atk":120,"def":120,"spa":60,"spd":90,"spe":80},"abilities":{"0":"Iron Fist"},"weightkg":202.5,"heightm":1.2,"spriteid":"metang"},"golurkam":{"num":623,"name":"Golurk-Am","baseSpecies":"Golurk","forme":"Am","types":["Steel","Ghost"],"baseStats":{"hp":120,"atk":140,"def":90,"spa":90,"spd":90,"spe":40},"abilities":{"0":"Aftermath"},"weightkg":330,"heightm":2.8,"spriteid":"golurk"},"tangelarift":{"num":114,"name":"Tangela-Rift","baseSpecies":"Tangela","forme":"Rift","types":["Grass","Dark"],"baseStats":{"hp":65,"atk":55,"def":15,"spa":100,"spd":40,"spe":60},"abilities":{"0":"Dancer"},"weightkg":35,"heightm":1,"spriteid":"tangela"},"raltsrift":{"num":280,"name":"Ralts-Rift","baseSpecies":"Ralts","forme":"Rift","types":["Poison"],"baseStats":{"hp":56,"atk":50,"def":50,"spa":90,"spd":70,"spe":80},"abilities":{"0":"Friend Guard"},"weightkg":6.6,"heightm":0.4,"spriteid":"ralts"},"kirliarift":{"num":281,"name":"Kirlia-Rift","baseSpecies":"Kirlia","forme":"Rift","types":["Fire"],"baseStats":{"hp":76,"atk":70,"def":70,"spa":130,"spd":110,"spe":100},"abilities":{"0":"Friend Guard"},"weightkg":20.2,"heightm":0.8,"spriteid":"kirlia"},"regirockrift":{"num":377,"name":"Regirock-Rift","baseSpecies":"Regirock","forme":"Rift","types":["Rock","Fighting"],"baseStats":{"hp":80,"atk":135,"def":70,"spa":135,"spd":70,"spe":150},"abilities":{"0":"True Shot"},"weightkg":110,"heightm":1.7,"spriteid":"regirock"},"hippowdonrift":{"num":450,"name":"Hippowdon-Rift","baseSpecies":"Hippowdon","forme":"Rift","types":["Ground","Poison"],"baseStats":{"hp":115,"atk":135,"def":150,"spa":125,"spd":115,"spe":35},"abilities":{"0":"Accumulation"},"weightkg":802.5,"heightm":2,"spriteid":"hippowdon"},"carnivinerift":{"num":455,"name":"Carnivine-Rift","baseSpecies":"Carnivine","forme":"Rift","types":["Grass","Dragon"],"baseStats":{"hp":104,"atk":120,"def":72,"spa":110,"spd":72,"spe":96},"abilities":{"0":"Own Tempo"},"weightkg":101.1,"heightm":1.4,"spriteid":"carnivine"},"carnivinerift2":{"num":455,"name":"Carnivine-Rift2","baseSpecies":"Carnivine","forme":"Rift2","types":["Grass","Steel"],"baseStats":{"hp":104,"atk":120,"def":72,"spa":110,"spd":72,"spe":96},"abilities":{"0":"Own Tempo"},"weightkg":101.1,"heightm":1.4,"spriteid":"carnivine"},"carnivinerift3":{"num":455,"name":"Carnivine-Rift3","baseSpecies":"Carnivine","forme":"Rift3","types":["Grass","Bug"],"baseStats":{"hp":104,"atk":120,"def":72,"spa":110,"spd":72,"spe":96},"abilities":{"0":"Own Tempo"},"weightkg":101.1,"heightm":1.4,"spriteid":"carnivine"},"tangrowthrift":{"num":465,"name":"Tangrowth-Rift","baseSpecies":"Tangrowth","forme":"Rift","types":["Grass","Ghost"],"baseStats":{"hp":100,"atk":100,"def":125,"spa":110,"spd":50,"spe":50},"abilities":{"0":"Dancer"},"weightkg":128.6,"heightm":2,"spriteid":"tangrowth"},"garbodorrift":{"num":569,"name":"Garbodor-Rift","baseSpecies":"Garbodor","forme":"Rift","types":["Poison","Dark"],"baseStats":{"hp":120,"atk":80,"def":190,"spa":120,"spd":190,"spe":10},"abilities":{"0":"Poison Heal"},"weightkg":101.1,"heightm":1.9,"spriteid":"garbodor"},"garbodorriftbaby":{"num":569,"name":"Garbodor-RiftBaby","baseSpecies":"Garbodor","forme":"RiftBaby","types":["Poison","Dark"],"baseStats":{"hp":80,"atk":95,"def":82,"spa":60,"spd":82,"spe":75},"abilities":{"0":"Stench"},"weightkg":107.3,"heightm":1.9,"spriteid":"garbodor"},"galvantularift":{"num":596,"name":"Galvantula-Rift","baseSpecies":"Galvantula","forme":"Rift","types":["Poison","Electric"],"baseStats":{"hp":100,"atk":87,"def":80,"spa":117,"spd":80,"spe":108},"abilities":{"0":"Unnerve"},"weightkg":101.1,"heightm":0.8,"spriteid":"galvantula"},"galvantulariftegg":{"num":596,"name":"Galvantula-RiftEgg","baseSpecies":"Galvantula","forme":"RiftEgg","types":["Poison","Electric"],"baseStats":{"hp":100,"atk":47,"def":50,"spa":57,"spd":50,"spe":65},"abilities":{"0":"Parental Bond"},"weightkg":101.1,"heightm":0.8,"spriteid":"galvantula"},"ferrothornrifts":{"num":598,"name":"Ferrothorn-Rift-S","baseSpecies":"Ferrothorn","forme":"Rift-S","types":["Fire","Steel"],"baseStats":{"hp":150,"atk":80,"def":150,"spa":50,"spd":150,"spe":20},"abilities":{"0":"Flash Fire"},"weightkg":210.1,"heightm":1,"spriteid":"ferrothorn"},"ferrothornriftu":{"num":598,"name":"Ferrothorn-Rift-U","baseSpecies":"Ferrothorn","forme":"Rift-U","types":["Fire","Steel"],"baseStats":{"hp":150,"atk":150,"def":100,"spa":150,"spd":100,"spe":150},"abilities":{"0":"Sheer Force"},"weightkg":210.1,"heightm":1,"spriteid":"ferrothorn"},"xerneasrift":{"num":716,"name":"Xerneas-Rift","baseSpecies":"Xerneas","forme":"Rift","types":["Flying"],"baseStats":{"hp":150,"atk":70,"def":100,"spa":140,"spd":100,"spe":20},"abilities":{"0":"Tempest"},"weightkg":1,"heightm":3,"spriteid":"xerneas"},"volcanionrift":{"num":721,"name":"Volcanion-Rift","baseSpecies":"Volcanion","forme":"Rift","types":["Water","Fire"],"baseStats":{"hp":110,"atk":60,"def":80,"spa":150,"spd":90,"spe":20},"abilities":{"0":"Water Absorb"},"weightkg":101.1,"heightm":1.7,"spriteid":"volcanion"},"solrockfusion":{"num":-1000,"name":"Solrock Fusion","types":["Rock","Psychic"],"baseStats":{"hp":90,"atk":110,"def":90,"spa":75,"spd":90,"spe":44},"abilities":{"0":"Solaridol"},"weightkg":154,"heightm":1.2},"lunatonefusion":{"num":-1000,"name":"Lunatone Fusion","types":["Rock","Psychic"],"baseStats":{"hp":90,"atk":44,"def":90,"spa":110,"spd":90,"spe":75},"abilities":{"0":"Lunaridol"},"weightkg":168,"heightm":1.2},"gastrodonaevian":{"num":423,"name":"Gastrodon-Aevian","baseSpecies":"Gastrodon","forme":"Aevian","types":["Ground","Fairy"],"baseStats":{"hp":118,"atk":83,"def":68,"spa":92,"spd":82,"spe":39},"abilities":{"0":"Storm Drain"},"weightkg":299,"heightm":0.9,"spriteid":"gastrodon"},"palossandrocky":{"num":770,"name":"Palossand-Rocky","baseSpecies":"Palossand","forme":"Rocky","types":["Ghost","Rock"],"baseStats":{"hp":85,"atk":75,"def":110,"spa":100,"spd":75,"spe":35},"abilities":{"0":"Clear Body"},"weightkg":250,"heightm":1.3,"spriteid":"palossand"},"palossandfiery":{"num":770,"name":"Palossand-Fiery","baseSpecies":"Palossand","forme":"Fiery","types":["Ghost","Fire"],"baseStats":{"hp":85,"atk":75,"def":110,"spa":100,"spd":75,"spe":35},"abilities":{"0":"Flame Body"},"weightkg":250,"heightm":1.3,"spriteid":"palossand"},"palossandicy":{"num":770,"name":"Palossand-Icy","baseSpecies":"Palossand","forme":"Icy","types":["Ghost","Ice"],"baseStats":{"hp":85,"atk":75,"def":110,"spa":100,"spd":75,"spe":35},"abilities":{"0":"Ice Body"},"weightkg":250,"heightm":1.3,"spriteid":"palossand"},"snorlaxmega":{"num":143,"name":"Snorlax-Mega","baseSpecies":"Snorlax","forme":"Mega","types":["Normal","Grass"],"baseStats":{"hp":160,"atk":140,"def":95,"spa":65,"spd":130,"spe":50},"abilities":{"0":"Thick Fat"},"weightkg":460,"heightm":2.1,"requiredItem":"Snorlaxite","isMega":true,"spriteid":"snorlax-gmax"},"corviknightmega":{"num":823,"name":"Corviknight-Mega","baseSpecies":"Corviknight","forme":"Mega","types":["Flying","Steel"],"baseStats":{"hp":98,"atk":117,"def":135,"spa":63,"spd":105,"spe":77},"abilities":{"0":"Intimidate"},"weightkg":75,"heightm":2.2,"requiredItem":"Corviknite","isMega":true,"spriteid":"corviknight-gmax"},"grimmsnarlmega":{"num":861,"name":"Grimmsnarl-Mega","baseSpecies":"Grimmsnarl","forme":"Mega","types":["Dark","Fairy"],"baseStats":{"hp":95,"atk":145,"def":95,"spa":105,"spd":105,"spe":65},"abilities":{"0":"Sheer Force"},"weightkg":61,"heightm":1.5,"requiredItem":"Grimmsnarlite","isMega":true,"spriteid":"grimmsnarl-gmax"},"butterfreemega":{"num":12,"name":"Butterfree-Mega","baseSpecies":"Butterfree","forme":"Mega","types":["Bug","Psychic"],"baseStats":{"hp":60,"atk":45,"def":70,"spa":135,"spd":100,"spe":85},"abilities":{"0":"Compound Eyes"},"weightkg":32,"heightm":1.1,"requiredItem":"Butterfreenite","isMega":true,"spriteid":"butterfree-gmax"},"laprasmega":{"num":131,"name":"Lapras-Mega","baseSpecies":"Lapras","forme":"Mega","types":["Water","Ice"],"baseStats":{"hp":130,"atk":95,"def":100,"spa":120,"spd":120,"spe":70},"abilities":{"0":"Snow Warning"},"weightkg":220,"heightm":2.5,"requiredItem":"Laprasite","isMega":true,"spriteid":"lapras-gmax"},"machampmega":{"num":68,"name":"Machamp-Mega","baseSpecies":"Machamp","forme":"Mega","types":["Fighting"],"baseStats":{"hp":90,"atk":165,"def":105,"spa":65,"spd":105,"spe":75},"abilities":{"0":"Iron Fist"},"weightkg":130,"heightm":1.6,"requiredItem":"Machampite","isMega":true,"spriteid":"machamp-gmax"},"kinglermega":{"num":99,"name":"Kingler-Mega","baseSpecies":"Kingler","forme":"Mega","types":["Water","Steel"],"baseStats":{"hp":55,"atk":160,"def":135,"spa":50,"spd":75,"spe":100},"abilities":{"0":"Tough Claws"},"weightkg":60,"heightm":1.3,"requiredItem":"Kinglerite","isMega":true,"spriteid":"kingler-gmax"},"garbodormega":{"num":569,"name":"Garbodor-Mega","baseSpecies":"Garbodor","forme":"Mega","types":["Poison","Steel"],"baseStats":{"hp":80,"atk":125,"def":122,"spa":60,"spd":122,"spe":65},"abilities":{"0":"Gooey"},"weightkg":107.3,"heightm":1.9,"requiredItem":"Garbodorite","isMega":true,"spriteid":"garbodor-gmax"},"toxtricitymega":{"num":849,"name":"Toxtricity-Mega","baseSpecies":"Toxtricity","forme":"Mega","types":["Electric","Poison"],"baseStats":{"hp":75,"atk":128,"def":80,"spa":144,"spd":80,"spe":95},"abilities":{"0":"Punk Rock"},"weightkg":40,"heightm":1.6,"requiredItem":"Toxtricitite","isMega":true,"spriteid":"toxtricity-gmax"},"centiskorchmega":{"num":851,"name":"Centiskorch-Mega","baseSpecies":"Centiskorch","forme":"Mega","types":["Fire","Bug"],"baseStats":{"hp":100,"atk":145,"def":90,"spa":110,"spd":110,"spe":70},"abilities":{"0":"Flash Fire"},"weightkg":120,"heightm":3,"requiredItem":"Centiskorchite","isMega":true,"spriteid":"centiskorch-gmax"},"coalossalmega":{"num":839,"name":"Coalossal-Mega","baseSpecies":"Coalossal","forme":"Mega","types":["Rock","Fire"],"baseStats":{"hp":110,"atk":100,"def":145,"spa":115,"spd":110,"spe":30},"abilities":{"0":"Steam Engine"},"weightkg":310.5,"heightm":2.8,"requiredItem":"Coalossalite","isMega":true,"spriteid":"coalossal-gmax"},"duraludonmega":{"num":884,"name":"Duraludon-Mega","baseSpecies":"Duraludon","forme":"Mega","types":["Steel","Dragon"],"baseStats":{"hp":70,"atk":115,"def":145,"spa":150,"spd":75,"spe":80},"abilities":{"0":"Stalwart"},"weightkg":40,"heightm":1.8,"requiredItem":"Duraludonite","isMega":true,"spriteid":"duraludon-gmax"},"melmetalmega":{"num":809,"name":"Melmetal-Mega","baseSpecies":"Melmetal","forme":"Mega","types":["Steel"],"baseStats":{"hp":135,"atk":173,"def":173,"spa":90,"spd":85,"spe":44},"abilities":{"0":"Iron Fist"},"weightkg":800,"heightm":2.5,"requiredItem":"Melmetalite","isMega":true,"spriteid":"melmetal-gmax"}};

const CUSTOM_MOVES = {"hiddenpowerfairy":{"num":-2000,"name":"Hidden Power Fairy","type":"Fairy","category":"Special","basePower":60,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"venamskiss":{"num":-2001,"name":"Venam's Kiss","type":"Poison","category":"Physical","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"galestrike":{"num":-2002,"name":"Gale Strike","type":"Fighting","category":"Physical","basePower":60,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"multipulse":{"num":-2003,"name":"Multipulse","type":"Normal","category":"Special","basePower":65,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"spectralscream":{"num":-2004,"name":"Spectral Scream","type":"Ghost","category":"Special","basePower":65,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"gildedarrow":{"num":-2005,"name":"Gilded Arrow","type":"Normal","category":"Special","basePower":80,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"barbedweb":{"num":-2006,"name":"Barbed Web","type":"Bug","category":"Physical","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"coldtruth":{"num":-2007,"name":"Cold Truth","type":"Ice","category":"Special","basePower":95,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"feverpitch":{"num":-2008,"name":"Fever Pitch","type":"Fire","category":"Special","basePower":70,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"thunderraid":{"num":-2009,"name":"Thunder Raid","type":"Electric","category":"Physical","basePower":20,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move.","multihit":3},"uproot":{"num":-2010,"name":"Uproot","type":"Grass","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"bunrakubeatdown":{"num":-2011,"name":"Bunraku Beatdown","type":"Psychic","category":"Special","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"matrixshot":{"num":-2012,"name":"Matrix Shot","type":"Rock","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"superumdmove":{"num":-2013,"name":"Super UMD Move","type":"Steel","category":"Physical","basePower":100,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"deluge":{"num":-2014,"name":"Deluge","type":"Water","category":"Physical","basePower":60,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"aquabatics":{"num":-2015,"name":"Aquabatics","type":"Water","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"mudbarrage":{"num":-2016,"name":"Mud Barrage","type":"Ground","category":"Special","basePower":25,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move.","multihit":[2,5]},"heavenlywing":{"num":-2017,"name":"Heavenly Wing","type":"Flying","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"desertsmark":{"num":-2018,"name":"Desert's Mark","type":"Ground","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"decimation":{"num":-2019,"name":"Decimation","type":"Dark","category":"Special","basePower":100,"accuracy":100,"pp":10,"priority":1,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"pyrokineses":{"num":-2020,"name":"Pyrokinesis","type":"Psychic","category":"Special","basePower":80,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"alphashot":{"num":-2021,"name":"Alpha Shot","type":"Normal","category":"Special","basePower":50,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"gildedhelix":{"num":-2022,"name":"Gilded Helix","type":"Normal","category":"Special","basePower":50,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"poisonsweep":{"num":-2023,"name":"Poison Sweep","type":"Poison","category":"Physical","basePower":50,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"stackingshot":{"num":-2024,"name":"Stacking Shot","type":"Fighting","category":"Physical","basePower":40,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"irritation":{"num":-2025,"name":"Irritation","type":"Bug","category":"Special","basePower":60,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"magmadrift":{"num":-2026,"name":"Magma Drift","type":"Fire","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"slashandburn":{"num":-2027,"name":"Slash and Burn","type":"Grass","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1,"slicing":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"arenitewall":{"num":-2028,"name":"Arenite Wall","type":"Ground","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"quicksilverspear":{"num":-2029,"name":"Quicksilver Spear","type":"Steel","category":"Physical","basePower":80,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"sparkleon":{"num":-2030,"name":"Sparkle On","type":"Fairy","category":"Physical","basePower":120,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move.","recoil":[1,33]},"solarflare":{"num":-2031,"name":"Solar Flare","type":"Fire","category":"Physical","basePower":100,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1,"slicing":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"hoarfrostmoon":{"num":-2032,"name":"Hoarfrost Moon","type":"Ice","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"hexingslash":{"num":-2033,"name":"Hexing Slash","type":"Ghost","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1,"slicing":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move.","drain":[1,3]},"wakeupshock":{"num":-2034,"name":"Wake-Up Shock","type":"Electric","category":"Physical","basePower":80,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"vileassault":{"num":-2035,"name":"Vile Assault","type":"Poison","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"etherealtempest":{"num":-2036,"name":"Ethereal Tempest","type":"Flying","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"mirrorbeam":{"num":-2037,"name":"Mirror Beam","type":"Steel","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowend":{"num":-2038,"name":"Shadow End","type":"Shadow","category":"Special","basePower":120,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move.","recoil":[1,4]},"shadowstorm":{"num":-2039,"name":"Shadow Storm","type":"Shadow","category":"Special","basePower":95,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowblast":{"num":-2040,"name":"Shadow Blast","type":"Shadow","category":"Special","basePower":80,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowbolt":{"num":-2041,"name":"Shadow Bolt","type":"Shadow","category":"Special","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowbreak":{"num":-2042,"name":"Shadow Break","type":"Shadow","category":"Physical","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowchill":{"num":-2043,"name":"Shadow Chill","type":"Shadow","category":"Special","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowfire":{"num":-2044,"name":"Shadow Fire","type":"Shadow","category":"Special","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowrave":{"num":-2045,"name":"Shadow Rave","type":"Shadow","category":"Special","basePower":70,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowrush":{"num":-2046,"name":"Shadow Rush","type":"Shadow","category":"Physical","basePower":55,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move.","recoil":[1,4]},"shadowwave":{"num":-2047,"name":"Shadow Wave","type":"Shadow","category":"Physical","basePower":50,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowblitz":{"num":-2048,"name":"Shadow Blitz","type":"Shadow","category":"Physical","basePower":40,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowdown":{"num":-2049,"name":"Shadow Down","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowhalf":{"num":-2050,"name":"Shadow Half","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowhold":{"num":-2051,"name":"Shadow Hold","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowmist":{"num":-2052,"name":"Shadow Mist","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowpanic":{"num":-2053,"name":"Shadow Panic","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowshed":{"num":-2054,"name":"Shadow Shed","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowsky":{"num":-2055,"name":"Shadow Sky","type":"Shadow","category":"Status","basePower":0,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"shadowbeam":{"num":-2056,"name":"Shadow Beam","type":"Shadow","category":"Special","basePower":60,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"pyrokinesis":{"num":-2020,"name":"Pyrokinesis","type":"Psychic","category":"Special","basePower":80,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"ethertempest":{"num":-2036,"name":"Ethereal Tempest","type":"Flying","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal","shortDesc":"Custom Rejuvenation/Desolation signature move."},"radiantclaw":{"num":-2200,"name":"Radiant Claw","type":"Dragon","category":"Physical","basePower":85,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal"},"vorpalblade":{"num":-2200,"name":"Vorpal Blade","type":"Steel","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1,"slicing":1},"target":"normal"},"ravage":{"num":-2200,"name":"Ravage","type":"Dark","category":"Physical","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal"},"promisedpain":{"num":-2200,"name":"Promised Pain","type":"Ghost","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal"},"beasthunter":{"num":-2200,"name":"Beast Hunter","type":"Fighting","category":"Physical","basePower":85,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"target":"normal"},"injection":{"num":-2200,"name":"Injection","type":"Poison","category":"Physical","basePower":75,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1},"secondary":{"chance":50,"status":"psn"},"target":"normal"},"bangleblade":{"num":-2200,"name":"Bangle Blade","type":"Fairy","category":"Physical","basePower":85,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1,"contact":1,"slicing":1},"target":"normal"},"frozenfury":{"num":-2200,"name":"Frozen Fury","type":"Ice","category":"Special","basePower":95,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal"},"burninghate":{"num":-2200,"name":"Burning Hate","type":"Fire","category":"Special","basePower":95,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"normal"},"starfall":{"num":-2200,"name":"Starfall","type":"Fairy","category":"Special","basePower":90,"accuracy":100,"pp":10,"priority":0,"flags":{"protect":1,"mirror":1},"target":"allAdjacentFoes"}};

const MEGA_STONES = {"Snorlaxite":["Snorlax","Snorlax-Mega"],"Corviknite":["Corviknight","Corviknight-Mega"],"Grimmsnarlite":["Grimmsnarl","Grimmsnarl-Mega"],"Butterfreenite":["Butterfree","Butterfree-Mega"],"Laprasite":["Lapras","Lapras-Mega"],"Machampite":["Machamp","Machamp-Mega"],"Kinglerite":["Kingler","Kingler-Mega"],"Garbodorite":["Garbodor","Garbodor-Mega"],"Toxtricitite":["Toxtricity","Toxtricity-Mega"],"Centiskorchite":["Centiskorch","Centiskorch-Mega"],"Coalossalite":["Coalossal","Coalossal-Mega"],"Duraludonite":["Duraludon","Duraludon-Mega"],"Melmetalite":["Melmetal","Melmetal-Mega"],"Cinccinite":["Cinccino","Cinccino-Mega"],"Feraligatrite":["Feraligatr","Feraligatr-Mega"],"Luxrite":["Luxray","Luxray-Mega"],"Mightyenite":["Mightyena","Mightyena-Mega"],"Toxicroakite":["Toxicroak","Toxicroak-Mega"]};

const CREST_NAMES = ["Gothitelle Crest","Magcargo Crest","Fearow Crest","Stantler Crest","Hypno Crest","Glaceon Crest","Leafeon Crest","Relicanth Crest","Oricorio Crest","Silvally Crest","Seviper Crest","Cofagrigus Crest","Dusknoir Crest","Skuntank Crest","Darmanitan Crest","Cherrim Crest","Claydol Crest","Dedenne Crest","Zangoose Crest","Bastiodon Crest","Meganium Crest","Typhlosion Crest","Feraligatr Crest","Rampardos Crest","Ledian Crest","Ariados Crest","Spiritomb Crest","Whiscash Crest","Beheeyem Crest","Torterra Crest","Infernape Crest","Empoleon Crest","Cryogonal Crest","Castform Crest","Thievul Crest","Probopass Crest","Druddigon Crest","Cinccino Crest","Noctowl Crest","Luxray Crest","Boltund Crest","Vespiquen Crest","Phione Crest","Delcatty Crest","Swalot Crest","Samurott Crest","Reuniclus Crest","Electrode Crest","Crabominable Crest","Simisear Crest","Simipour Crest","Simisage Crest","Sawsbuck Crest","Shiinotic Crest","A.Ampharos Crest","Luvdisc Crest","Zoroark Crest","Unown Crest","Furret Crest"];

// Canonical Field Seed activations across all 63 field states
const FIELD_SEEDS = {
  electric: {seed: 'elementalseed', boosts: {def: 1}, volatile: 'charge'},
  grassy: {seed: 'elementalseed', boosts: {def: 1}, volatile: 'ingrain'},
  misty: {seed: 'elementalseed', boosts: {spd: 1}},
  darkcrystalcavern: {seed: 'magicalseed', boosts: {spd: 1}, volatile: 'magiccoat'},
  chess: {seed: 'syntheticseed', boosts: {spa: 1}, volatile: 'magiccoat'},
  bigtop: {seed: 'syntheticseed', boosts: {atk: 1}},
  burning: {seed: 'elementalseed', boosts: {atk: 1, spa: 1, spe: 1}},
  swamp: {seed: 'telluricseed', boosts: {def: 1, spd: 1}, volatile: 'ingrain'},
  rainbow: {seed: 'magicalseed', boosts: {spa: 1}},
  corrosive: {seed: 'telluricseed', boosts: {atk: 1}, volatile: 'banefulbunker'},
  corrosivemist: {seed: 'elementalseed', boosts: {atk: 1, spa: 1}, selfStatus: 'tox'},
  desert: {seed: 'telluricseed', boosts: {def: 1, spd: 1, spe: 1}},
  icy: {seed: 'elementalseed', boosts: {spe: 2}},
  rocky: {seed: 'telluricseed', boosts: {def: 1, spd: 1}, rockChip: true},
  forest: {seed: 'telluricseed', boosts: {atk: 1}, volatile: 'spikyshield'},
  superheated: {seed: 'telluricseed', boosts: {def: 1}},
  factory: {seed: 'syntheticseed', boosts: {spa: 1}, volatile: 'laserfocus'},
  shortcircuit: {seed: 'syntheticseed', boosts: {spd: 1}, volatile: 'magnetrise'},
  wasteland: {seed: 'telluricseed', boosts: {atk: 1, spa: 1}},
  ashenbeach: {seed: 'telluricseed', boosts: {}, volatile: 'laserfocus'},
  watersurface: {seed: 'elementalseed', boosts: {spd: 1}, volatile: 'aquaring'},
  underwater: {seed: 'elementalseed', boosts: {spe: 1}, soak: true},
  cave: {seed: 'telluricseed', boosts: {def: 2}, rockChip: true},
  glitch: {seed: 'syntheticseed', boosts: {def: 1, spd: 1}},
  crystalcavern: {seed: 'magicalseed', boosts: {spa: 1}, volatile: 'magiccoat'},
  murkwatersurface: {seed: 'elementalseed', boosts: {spe: 1}, volatile: 'aquaring', selfStatus: 'psn'},
  mountain: {seed: 'telluricseed', boosts: {atk: 2, accuracy: -1}},
  snowymountain: {seed: 'telluricseed', boosts: {spa: 2, accuracy: -1}},
  holy: {seed: 'magicalseed', boosts: {spa: 1}, volatile: 'magiccoat'},
  mirror: {seed: 'syntheticseed', boosts: {evasion: 2}},
  fairytale: {seed: 'magicalseed', boosts: {atk: 1}, volatile: 'kingsshield'},
  dragonsden: {seed: 'elementalseed', boosts: {spa: 1}, volatile: 'flashfire'},
  flowergarden1: {seed: 'syntheticseed', boosts: {spd: 1}, volatile: 'ingrain'},
  flowergarden2: {seed: 'syntheticseed', boosts: {spd: 1}, volatile: 'ingrain'},
  flowergarden3: {seed: 'syntheticseed', boosts: {spd: 1}, volatile: 'ingrain'},
  flowergarden4: {seed: 'syntheticseed', boosts: {spd: 1}, volatile: 'ingrain'},
  flowergarden5: {seed: 'syntheticseed', boosts: {spd: 1}, volatile: 'ingrain'},
  starlight: {seed: 'magicalseed', boosts: {spa: 1}},
  newworld: {seed: 'magicalseed', boosts: {atk: 1, def: 1, spa: 1, spd: 1, spe: 1}, volatile: 'mustrecharge'},
  inverse: {seed: 'magicalseed', boosts: {spa: 1, spd: 1}},
  psychic: {seed: 'magicalseed', boosts: {spa: 2}, volatile: 'confusion'},
  dimensional: {seed: 'magicalseed', boosts: {def: 1}, trickRoom: true},
  frozendimensional: {seed: 'elementalseed', boosts: {spe: 2}},
  haunted: {seed: 'magicalseed', boosts: {def: 1, spd: 1}},
  corruptedcave: {seed: 'syntheticseed', boosts: {def: 2}, selfStatus: 'psn'},
  bewitchedwoods: {seed: 'magicalseed', boosts: {spd: 1}, volatile: 'ingrain'},
  sky: {seed: 'elementalseed', boosts: {def: -1, spd: -1}, tailwind: true},
  colosseum: {seed: 'telluricseed', boosts: {atk: 1, def: 1}},
  infernal: {seed: 'elementalseed', boosts: {spa: 1, spe: 1}},
  volcanictop: {seed: 'telluricseed', boosts: {def: 1}},
  deepearth: {seed: 'telluricseed', boosts: {def: 1, spd: 1}},
  backalley: {seed: 'syntheticseed', boosts: {atk: 1, spe: 1}},
  city: {seed: 'syntheticseed', boosts: {def: 1, spd: 1}},
  concert1: {seed: 'syntheticseed', boosts: {spa: 1}},
  concert2: {seed: 'syntheticseed', boosts: {spa: 1, spe: 1}},
  concert3: {seed: 'syntheticseed', boosts: {spa: 1, spe: 1}},
  concert4: {seed: 'syntheticseed', boosts: {spa: 2, spe: 1}},
  crowd: {seed: 'syntheticseed', boosts: {atk: 1}},
  dancefloor: {seed: 'syntheticseed', boosts: {spe: 1}},
  darkness1: {seed: 'magicalseed', boosts: {spa: 1}, advanceField: 'darkness2'},
  darkness2: {seed: 'magicalseed', boosts: {spa: 1}, advanceField: 'darkness3'},
  darkness3: {seed: 'magicalseed', boosts: {spa: 1, spd: 1}},
  cloud: {seed: 'elementalseed', boosts: {spd: 1}, tailwind: true},
};

function activateFieldSeed(battle, pokemon, field, setFieldFn) {
  if (!pokemon || pokemon.fainted || !pokemon.item || !field) return false;
  const cfg = FIELD_SEEDS[field.id];
  if (!cfg || pokemon.item !== cfg.seed) return false;
  if (!pokemon.useItem()) return false;
  if (cfg.boosts && Object.keys(cfg.boosts).length) {
    battle.boost(cfg.boosts, pokemon, pokemon);
  }
  if (cfg.volatile && !pokemon.volatiles[cfg.volatile]) {
    pokemon.addVolatile(cfg.volatile);
  }
  if (cfg.selfStatus && !pokemon.status) {
    pokemon.trySetStatus(cfg.selfStatus, pokemon);
  }
  if (cfg.soak && !pokemon.hasType('Water') && pokemon.setType('Water')) {
    battle.add('-start', pokemon, 'typechange', 'Water');
  }
  if (cfg.rockChip && !pokemon.hasAbility('magicguard')) {
    const eff = Math.pow(2, battle.dex.getEffectiveness('Rock', pokemon));
    battle.damage(Math.max(1, Math.floor((pokemon.maxhp * eff) / 8)), pokemon, pokemon);
  }
  if (cfg.tailwind) {
    pokemon.side.addSideCondition('tailwind', pokemon);
  }
  if (cfg.trickRoom && !battle.field.pseudoWeather.trickroom) {
    battle.field.addPseudoWeather('trickroom', pokemon);
  }
  if (cfg.advanceField && setFieldFn) {
    setFieldFn(battle, cfg.advanceField, {msg: 'The Magical Seed deepened the darkness!'});
  }
  return true;
}

const CUSTOM_ABILITIES = {
  prismpower: {
    name: 'Prism Power',
    onSourceModifyDamage(damage, source, target, move) {
      if (target.getMoveHitData(move).typeMod > 0) return this.chainModify(0.75);
    },
  },
  duskilate: {
    name: 'Duskilate',
    onModifyTypePriority: -1,
    onModifyType(move, pokemon) {
      if (move.type === 'Normal' && move.category !== 'Status') {
        move.type = 'Dark';
        move.typeChangerBoosted = this.effect;
      }
    },
    onBasePowerPriority: 23,
    onBasePower(basePower, pokemon, target, move) {
      if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
    },
  },
  solaridol: {
    name: 'Solar Idol',
    onStart(source) { this.field.setWeather('sunnyday'); },
    onBasePower(bp, attacker, defender, move) {
      if (move.type === 'Fire') return this.chainModify(1.3);
    },
  },
  lunaridol: {
    name: 'Lunar Idol',
    onStart(source) { this.field.setWeather('snow'); },
    onBasePower(bp, attacker, defender, move) {
      if (move.type === 'Ice') return this.chainModify(1.3);
    },
  },
  execution: {
    name: 'Execution',
    onBasePower(bp, attacker, defender) {
      if (defender && defender.hp * 2 <= defender.maxhp) return this.chainModify(1.5);
    },
  },
  inexorable: {
    name: 'Inexorable',
    onBasePower(bp, attacker, defender, move) {
      if (move.type === 'Dragon' && (!defender || !defender.newlySwitched)) return this.chainModify(1.3);
    },
  },
  accumulation: {
    name: 'Accumulation',
    onResidual(pokemon) {
      if (pokemon.hp && pokemon.hp < pokemon.maxhp) this.heal(Math.floor(pokemon.maxhp / 16));
    },
  },
  coalfurnace: {
    name: 'Coal Furnace',
    onTryHit(target, source, move) {
      if (target !== source && (move.type === 'Fire' || move.type === 'Water')) {
        this.boost({spe: 1});
        return null;
      }
    },
  },
  quakeproof: {
    name: 'Quakeproof',
    onTryHit(target, source, move) {
      if (target !== source && move.type === 'Ground') return null;
    },
  },
  trueshot: {
    name: 'True Shot',
    onBasePower(bp, attacker, defender, move) {
      if (move.flags?.bullet || move.flags?.pulse) return this.chainModify(1.3);
    },
  },
  reflector: {
    name: 'Reflector',
    onSourceModifyDamage(damage, source, target, move) {
      if (move.category === 'Special') return this.chainModify(0.8);
    },
  },
  resuscitation: {
    name: 'Resuscitation',
    onResidual(pokemon) {
      if (pokemon.hp && pokemon.hp < pokemon.maxhp) this.heal(Math.floor(pokemon.maxhp / 12));
    },
  },
  rescucitation: {
    name: 'Resuscitation',
    onResidual(pokemon) {
      if (pokemon.hp && pokemon.hp < pokemon.maxhp) this.heal(Math.floor(pokemon.maxhp / 12));
    },
  },
  wingsofruin: {
    name: 'Wings of Ruin',
    onBasePower(bp, attacker, defender, move) {
      if (move.type === 'Flying' || move.type === 'Dark') return this.chainModify(1.25);
    },
  },
  temporalshift: {
    name: 'Temporal Shift',
    onStart(pokemon) {
      if (!this.field.pseudoWeather.trickroom) this.field.addPseudoWeather('trickroom', pokemon);
    },
  },
  storm9: {
    name: 'Storm 9',
    onModifySpe(spe) { return this.chainModify(1.5); },
  },
  tempest: {
    name: 'Tempest',
    onBasePower(bp, attacker, defender, move) {
      if (move.flags?.wind || move.type === 'Flying') return this.chainModify(1.3);
    },
  },
  memoryleak: {
    name: 'Memory Leak',
    onBasePower(bp) { return this.chainModify(1.2); },
  },
  stancechangeblade: {name: 'Stance Change'},
  stancechangeshield: {name: 'Stance Change'},
};

function buildCrestItem(name) {
  const id = toID(name);
  const base = {
    name,
    num: -3000,
    gen: 9,
    onTakeItem: false,
    shortDesc: `Rejuvenation/Desolation Crest enhancing its holder.`,
  };
  switch (id) {
  case 'luxraycrest':
    return {
      ...base,
      onModifyTypePriority: -1,
      onModifyType(move, pokemon) {
        if (pokemon.baseSpecies.name === 'Luxray' && move.type === 'Normal' && move.category !== 'Status') {
          move.type = 'Electric';
          move.crestBoost = true;
        }
      },
      onBasePower(bp, pokemon, target, move) {
        if (pokemon.baseSpecies.name === 'Luxray' && (move.crestBoost || move.type === 'Dark')) return this.chainModify(1.2);
      },
    };
  case 'simisagecrest':
  case 'simisearcrest':
  case 'simipourcrest': {
    const el = id === 'simisagecrest' ? 'Grass' : id === 'simisearcrest' ? 'Fire' : 'Water';
    return {
      ...base,
      onModifyTypePriority: -1,
      onModifyType(move) {
        if (move.type === 'Normal' && move.category !== 'Status') { move.type = el; move.crestBoost = true; }
      },
      onBasePower(bp, pokemon, target, move) {
        if (move.crestBoost) return this.chainModify(1.2);
      },
    };
  }
  case 'zangoosecrest':
    return {
      ...base,
      onResidualOrder: 28,
      onResidualSubOrder: 3,
      onResidual(pokemon) {
        if (!pokemon.status) pokemon.trySetStatus('tox', pokemon);
      },
      onDamage(damage, target, source, effect) {
        if (effect.id === 'psn' || effect.id === 'tox') {
          this.heal(target.baseMaxhp / 8);
          return false;
        }
      },
      onBasePower(bp, pokemon, target, move) {
        if (pokemon.status && move.category === 'Physical') return this.chainModify(1.3);
      },
    };
  case 'typhlosioncrest':
    return {
      ...base,
      onModifyAtk(atk, pokemon) {
        const spa = pokemon.getStat('spa', false, true);
        if (spa > atk) return spa;
      },
      onBasePower(bp, pokemon, target, move) {
        if (move.flags?.contact) return this.chainModify(1.3);
      },
    };
  case 'feraligatrcrest':
    return {
      ...base,
      onModifyPriority(priority, pokemon, target, move) {
        if (pokemon.activeMoveActions < 1 && move.category !== 'Status') return priority + 1;
      },
      onBasePower(bp, pokemon, target, move) {
        if (move.flags?.bite) return this.chainModify(1.5);
      },
    };
  case 'meganiumcrest':
    return {
      ...base,
      onSourceModifyDamage(damage) { return this.chainModify(0.85); },
      onResidual(pokemon) { if (pokemon.hp < pokemon.maxhp) this.heal(Math.floor(pokemon.maxhp / 16)); },
    };
  case 'samurottcrest':
    return {
      ...base,
      onBasePower(bp, pokemon, target, move) {
        if (move.flags?.slicing) return this.chainModify(1.3);
      },
      onModifyCritRatio(critRatio) { return critRatio + 1; },
    };
  case 'claydolcrest':
    return {
      ...base,
      onBasePower(bp, pokemon, target, move) {
        if (/beam|psy|hyper|solar|charge|aurora|signal|flash|ice/i.test(move.id)) return this.chainModify(1.5);
      },
    };
  case 'dusknoircrest':
    return {
      ...base,
      onBasePower(bp, pokemon, target, move) {
        if (bp <= 60) return this.chainModify(1.5);
      },
    };
  case 'rampardoscrest':
    return {
      ...base,
      onDamage(damage, target, source, effect) {
        if (effect && effect.id === 'recoil') return null;
      },
    };
  case 'bastiodoncrest':
    return {
      ...base,
      onDamagingHit(damage, target, source) {
        if (source && source !== target) this.damage(Math.max(1, Math.floor(damage * 0.5)), source, target);
      },
    };
  case 'leafeoncrest':
  case 'glaceoncrest':
    return {
      ...base,
      onSourceModifyDamage(damage, source, target, move) {
        if (target.getMoveHitData(move).typeMod > 0) return this.chainModify(0.5);
      },
    };
  default:
    return {
      ...base,
      onBasePower(bp) { return this.chainModify(1.15); },
      onSourceModifyDamage(damage) { return this.chainModify(0.9); },
    };
  }
}

let customInstalled = false;
function installCustomDex() {
  if (customInstalled) return;
  customInstalled = true;

  const PLATE_TYPES = {
    flameplate: 'Fire', splashplate: 'Water', zapplate: 'Electric', meadowplate: 'Grass',
    icicleplate: 'Ice', fistplate: 'Fighting', toxicplate: 'Poison', earthplate: 'Ground',
    skyplate: 'Flying', mindplate: 'Psychic', insectplate: 'Bug', stoneplate: 'Rock',
    spookyplate: 'Ghost', dracoplate: 'Dragon', dreadplate: 'Dark', ironplate: 'Steel',
    pixieplate: 'Fairy',
  };

  for (const mod of ['gen9', 'champions']) {
    const d = Dex.mod(mod);

    // 1. Species
    for (const [id, sp] of Object.entries(CUSTOM_SPECIES)) {
      if (!d.data.Pokedex[id]) {
        d.data.Pokedex[id] = {...sp};
        d.species.speciesCache?.delete(id);
      }
      if (sp.baseSpecies) {
        const baseId = toID(sp.baseSpecies);
        const baseEntry = d.data.Pokedex[baseId];
        if (baseEntry) {
          baseEntry.otherFormes = baseEntry.otherFormes || [];
          if (!baseEntry.otherFormes.includes(sp.name)) baseEntry.otherFormes.push(sp.name);
          d.species.speciesCache?.delete(baseId);
        }
      }
    }

    // 2. Moves
    for (const [id, mv] of Object.entries(CUSTOM_MOVES)) {
      if (!d.data.Moves[id]) {
        const moveObj = {...mv};
        if (moveObj.type === 'Shadow') {
          moveObj.type = 'Dark';
          moveObj.ignoreImmunity = true;
          moveObj.onEffectiveness = function () {
            return 0;
          };
          if (id === 'shadowdown') {
            moveObj.boosts = {def: -2};
          } else if (id === 'shadowpanic') {
            moveObj.volatileStatus = 'confusion';
          } else if (id === 'shadowhalf') {
            moveObj.category = 'Special';
            moveObj.damageCallback = function (pokemon, target) {
              return Math.max(1, Math.floor(target.hp / 2));
            };
          }
        }
        if (id === 'multipulse') {
          moveObj.onModifyType = function (move, pokemon) {
            const it = pokemon.item;
            if (PLATE_TYPES[it]) move.type = PLATE_TYPES[it];
            else if (it.endsWith('memory')) {
              const memType = it.slice(0, -6);
              const cap = memType.charAt(0).toUpperCase() + memType.slice(1);
              move.type = cap;
            }
          };
        } else if (id === 'arenitewall') {
          moveObj.category = 'Status';
          moveObj.target = 'allySide';
          moveObj.sideCondition = 'auroraveil';
        }
        d.data.Moves[id] = moveObj;
        d.moves.moveCache?.delete(id);
      }
    }

    // 3. Abilities
    for (const [id, ab] of Object.entries(CUSTOM_ABILITIES)) {
      if (!d.data.Abilities[id]) {
        d.data.Abilities[id] = {num: -4000, gen: 9, ...ab};
        d.abilities.abilityCache?.delete(id);
      }
    }

    // 4. Field Seeds & Special Items
    for (const [id, name] of [
      ['elementalseed', 'Elemental Seed'],
      ['magicalseed', 'Magical Seed'],
      ['syntheticseed', 'Synthetic Seed'],
      ['telluricseed', 'Telluric Seed'],
    ]) {
      d.data.Items[id] = {
        name,
        num: -1001,
        gen: 9,
        fling: {basePower: 10},
        shortDesc: `Consumed on matching Reborn-verse fields to boost stats and apply field effects.`,
      };
      d.items.itemCache?.delete(id);
    }

    d.data.Items.amplifieldrock = {
      name: 'Amplifield Rock',
      num: -1005,
      gen: 9,
      fling: {basePower: 60},
      shortDesc: 'Extends terrain and field overlay duration to 8 turns.',
    };
    d.data.Items.blackprism = {name: 'Black Prism', num: -1006, gen: 9};
    d.data.Items.soulstone = {name: 'Soul Stone', num: -1007, gen: 9};
    d.data.Items.pulse = {name: 'PULSE', num: -1008, gen: 9, onTakeItem: false};

    // 5. Custom Mega Stones
    for (const [stoneName, [baseName, megaName]] of Object.entries(MEGA_STONES)) {
      const sid = toID(stoneName);
      if (!d.data.Items[sid]) {
        d.data.Items[sid] = {
          name: stoneName,
          num: -1100,
          gen: 9,
          megaStone: {[baseName]: megaName},
          itemUser: [baseName],
          onTakeItem: false,
        };
        d.items.itemCache?.delete(sid);
      }
    }

    // 6. Crests
    for (const crestName of CREST_NAMES) {
      const cid = toID(crestName);
      if (!d.data.Items[cid]) {
        d.data.Items[cid] = buildCrestItem(crestName);
        d.items.itemCache?.delete(cid);
      }
    }
  }
}

module.exports = {
  installCustomDex,
  activateFieldSeed,
  FIELD_SEEDS,
  CUSTOM_SPECIES,
  CUSTOM_MOVES,
};
