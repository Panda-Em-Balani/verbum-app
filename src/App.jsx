import { useState, useEffect, useRef } from "react";
import LoginPage from "./LoginPage.jsx";
import { requestNotificationPermission, initNotifications, getNotificationPermission } from "./notifications.js";
import { supabase } from "./supabase.js";

const GOLD = "#DBBC57";
const GOLD_BRIGHT = "#D4AF35";
const DARK = "#F1E4BC";
const SURFACE = "#F8F0DC";
const CARD = "#FEFCF5";
const BORDER = "#E2CA78";
const CREAM = "#2E1E08";
const MUTED = "#6B5535";
const WHITE = "#1A0E04";
const CINZEL = "'Cinzel', serif";
const EMBOSS = "0 1px 0 rgba(255,255,255,0.9), 0 -1px 0 rgba(0,0,0,0.12)";
const CARD_SHADOW = "0 2px 12px rgba(100,70,20,0.10), 0 1px 3px rgba(100,70,20,0.08)";
const CARD_SHADOW_STRONG = "0 4px 20px rgba(100,70,20,0.14), 0 2px 6px rgba(100,70,20,0.10)";
const HEADER_BG = "#3D2200";
const HEADER_H = 56; // fixed header height px

//  MASS STREAM CONFIG 
// Update MASS_STREAM_URL to your parish's YouTube channel live stream URL.
// Format: https://www.youtube.com/embed/LIVE_VIDEO_ID?autoplay=0
// For a live channel stream use: https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID
// Vatican News fallback is used by default — replace with your parish stream.
const MASS_STREAMS = [
  {
    label: "Vatican — Papal Mass",
    url: "https://www.youtube.com/embed/live_stream?channel=UCz6g_U1LHLQNR6vT0ENPMbA",
    note: "Live Masses from the Vatican, including Papal celebrations and daily Mass from St. Peter's Basilica.",
  },
  {
    label: "EWTN — Global Catholic Network",
    url: "https://www.youtube.com/embed/7RbAWZRMqBI",
    note: "EWTN broadcasts daily Mass, the Rosary, and Catholic programming 24 hours a day.",
  },
  {
    label: "Salt + Light — Catholic TV",
    url: "https://www.youtube.com/embed/live_stream?channel=UCHHmjz7kliVPUCkqMxRLWlA",
    note: "Canada-based Catholic channel with daily Mass, news, and spiritual programming.",
  },
];
// Add your parish stream here as the first entry in MASS_STREAMS if you have one.

//  VERSES 
const VERSES = [
  { id:1, ref:"Psalm 23:1", text:"The Lord is my shepherd; I shall not want.", book:"Psalms", category:["peace","trust","comfort"], explanation:"One of the most beloved psalms, written by King David, this verse opens a beautiful meditation on God's tender care. The image of a shepherd caring for his flock was deeply meaningful in the ancient world — a shepherd knew each sheep by name, led them to green pastures and still waters, and protected them from danger. For us today, it is a reminder that God is not a distant ruler but a loving guide who tends to our deepest needs.", example:"When you are overwhelmed by life's demands or feel spiritually dry, this verse is an anchor. Many saints recited Psalm 23 in their darkest hours — including before martyrdom — drawing peace from the certainty of God's presence." },
  { id:2, ref:"John 3:16", text:"For God so loved the world that he gave his only Son, so that everyone who believes in him might not perish but might have eternal life.", book:"John", category:["love","hope","faith"], explanation:"Often called 'the Gospel in miniature,' this verse captures the entire mystery of salvation in a single sentence. The word 'so' speaks of a love beyond measure — a love that moves from eternity into time, from the Father's heart to a manger, to a cross. In the Catholic tradition, this verse is at the heart of every Mass.", example:"When you doubt whether you are loved or worthy of God's mercy, return to this verse. St. Augustine wrote, 'Our heart is restless until it rests in Thee' — and it is John 3:16 that tells us why God pursued us: not because we earned it, but because love is His very nature." },
  { id:3, ref:"Philippians 4:13", text:"I have the strength for everything through him who empowers me.", book:"Philippians", category:["strength","courage","hope"], explanation:"St. Paul wrote this letter from prison — chained, uncertain of his fate, yet radiating joy. The 'strength' he speaks of is not natural willpower but a supernatural capacity that flows from his union with Christ. This verse does not promise that God will remove every difficulty, but that He will provide the inner strength to pass through it with grace.", example:"Whether you are facing a health crisis, a difficult relationship, or a demanding season — this verse is a promise. Many Catholic athletes, caregivers, and missionaries have taken it as their life verse, not as a guarantee of success, but as a confidence in God's sustaining grace." },
  { id:4, ref:"Jeremiah 29:11", text:"For I know the plans I have for you, says the Lord, plans for your welfare and not for evil, to give you a future and a hope.", book:"Jeremiah", category:["hope","purpose","trust"], explanation:"God spoke these words to the Israelites during the Babylonian exile — one of the darkest periods in their history. Yet into that darkness came this luminous promise: God had not forgotten them. The Hebrew word for 'welfare' here is shalom — a rich word meaning wholeness, peace, and flourishing. God's plan is always oriented toward our true good.", example:"This verse has brought courage to generations of believers in times of uncertainty — job loss, illness, family crisis, personal failure. It does not promise an easy path, but it promises a purposeful one, held in the hands of a God who sees the end from the beginning." },
  { id:5, ref:"Matthew 11:28", text:"Come to me, all you who labor and are burdened, and I will give you rest.", book:"Matthew", category:["comfort","rest","peace"], explanation:"Jesus spoke these words in the midst of a culture crushed by religious legalism. He offers something radical: rest — not as laziness, but as the deep refreshment of the soul that comes from abiding with Him. Catholic spirituality understands this rest as found especially in prayer, the sacraments, and the Eucharist — where we literally come to Him.", example:"In our age of constant productivity and noise, this invitation is countercultural and deeply needed. Many saints, including Thérèse of Lisieux, found their 'little way' — a childlike, trusting rest in God's arms — rooted in this very promise." },
  { id:6, ref:"Romans 8:28", text:"We know that all things work for good for those who love God, who are called according to his purpose.", book:"Romans", category:["trust","hope","suffering"], explanation:"St. Paul does not say that all things are good — he says that God works all things for good. Even suffering, loss, and failure are not wasted in God's economy. The Catechism echoes this: 'God permits evil in order to draw forth some greater good.' This is the mystery of the Cross — the worst event in history became the source of the world's salvation.", example:"When something terrible happens — a diagnosis, a betrayal, a loss — this verse does not minimize the pain. Instead, it invites us to trust in a God who is always at work beneath the surface of our lives, weaving even our darkest threads into a tapestry of redemption." },
  { id:7, ref:"Isaiah 40:31", text:"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.", book:"Isaiah", category:["strength","hope","renewal"], explanation:"The prophet Isaiah wrote this to a people who were exhausted — spiritually, physically, emotionally. Eagles do not flap their wings frantically to fly; they spread them wide and let the thermal winds carry them upward. Hoping in the Lord is like that — an act of surrender and trust that allows God's wind to lift us.", example:"Caregivers, parents, ministers, and anyone running on empty find deep resonance here. The promise is not that we will never tire — but that in waiting on God, we will find a strength that transcends our natural limits." },
  { id:8, ref:"Psalm 46:10", text:"Be still and know that I am God!", book:"Psalms", category:["peace","prayer","trust"], explanation:"In just eight words, this verse captures the entire spirituality of contemplative prayer. The word 'still' in Hebrew means to let go, to release, to slacken. It is an invitation — even a command — to stop our frantic activity and simply know God. In Catholic tradition, this verse is at the heart of contemplative life, from the Desert Fathers to the Carmelites.", example:"In an overstimulated world, this verse is medicine. Spending even five minutes in silent prayer — sitting with this verse, breathing it in — can reorient an entire day. St. Teresa of Ávila called this kind of prayer the 'prayer of quiet,' a gift that begins when we finally stop talking and simply rest." },
  { id:9, ref:"1 Corinthians 13:4-5", text:"Love is patient, love is kind. It is not jealous, it is not pompous, it is not inflated, it is not rude, it does not seek its own interests.", book:"1 Corinthians", category:["love","relationships","virtue"], explanation:"St. Paul's great hymn to love is perhaps the most quoted passage at Catholic weddings. But its original context was a divided, quarreling church. Paul wrote it not as a romantic poem but as a challenge. Every quality he describes is a concrete, demanding practice — patience, kindness, and the refusal to keep score are not feelings but choices.", example:"Try replacing the word 'love' in this passage with your own name and see where it challenges you. This is what many spiritual directors suggest — it reveals where we fall short and points us toward the transformation God desires." },
  { id:10, ref:"Proverbs 3:5-6", text:"Trust in the Lord with all your heart, on your own intelligence do not rely. In all your ways be mindful of him, and he will make straight your paths.", book:"Proverbs", category:["trust","guidance","wisdom"], explanation:"This wisdom cuts to the heart of the spiritual life: the battle between self-reliance and trust in God. The Hebrew word for 'trust' implies leaning on something — the way you lean against a wall, trusting it to hold you. True wisdom begins not with our own analysis but with a humble openness to God's guidance.", example:"When facing a major life decision — career, relationships, education — this verse is a practical guide. It does not mean we stop thinking, but that we subordinate our thinking to prayer, trusting that God will illumine what we cannot see on our own." },
  { id:11, ref:"John 14:27", text:"Peace I leave with you; my peace I give to you. Not as the world gives do I give it to you. Do not let your hearts be troubled or afraid.", book:"John", category:["peace","comfort","faith"], explanation:"Jesus spoke these words at the Last Supper, hours before His arrest. Even in that shadow, He offered peace — not the world's fragile peace of favorable circumstances, but His own divine peace. This is the peace that the martyrs faced death with, that the saints found in prison cells and sickbeds.", example:"This verse is a powerful antidote to anxiety. When worry grips the heart, praying these words slowly can be transformative. Many Catholics pray this verse in Eucharistic adoration, allowing Christ's peace to settle into the deepest places of fear." },
  { id:12, ref:"Lamentations 3:22-23", text:"The Lord's acts of mercy are not exhausted, his compassion is not spent; they are renewed each morning — great is your faithfulness!", book:"Lamentations", category:["mercy","hope","renewal"], explanation:"This luminous verse appears in one of Scripture's most desolate books — written in the ruins of Jerusalem. And yet in that rubble, the author discovers something unshakeable: God's mercies are new every morning. In Catholic spirituality, every morning Mass echoes this: a new day, a new celebration of God's faithful love.", example:"For anyone who has fallen, failed, or feels trapped in guilt — this verse is resurrection language. God's mercy does not run out. Yesterday's failures do not exhaust today's grace. Each morning is a fresh start, offered freely by a faithful God." },
  { id:13, ref:"Luke 1:37", text:"For nothing will be impossible for God.", book:"Luke", category:["faith","hope","trust"], explanation:"The angel Gabriel spoke these words to Mary at the Annunciation. It is the great declaration of divine omnipotence, spoken to reassure a young woman asked to do the humanly impossible. In Catholic tradition, this verse is treasured especially in Marian prayer, reminding us that Mary's 'yes' to the impossible is a model for our own surrender to God's will.", example:"When a situation seems beyond all hope — a prodigal child, a broken marriage, an impossible dream — this verse is an anchor." },
  { id:14, ref:"Matthew 5:4", text:"Blessed are they who mourn, for they will be comforted.", book:"Matthew", category:["grief","comfort","hope"], explanation:"From the Beatitudes — Jesus' revolutionary re-ordering of what counts as blessed. In a world that prizes happiness and avoidance of pain, Jesus blesses those who mourn. The word 'comforted' shares a root with Paraclete — the Holy Spirit. Our grief is met by the very Spirit of God.", example:"In times of loss — death, divorce, disappointment — this beatitude gives grief its rightful place. The Catholic tradition of All Souls' Day and funeral Masses honors the reality of mourning while pointing always toward comfort and resurrection." },
  { id:15, ref:"Psalm 34:18", text:"The Lord is close to the brokenhearted, saves those whose spirit is crushed.", book:"Psalms", category:["grief","comfort","healing"], explanation:"Rather than being distant from weakness, the Lord draws near to it. 'Brokenhearted' in Hebrew describes a heart shattered like a clay pot — completely broken. And it is precisely there that God is closest. This is the logic of the Incarnation: God does not observe our suffering from above but enters it, taking on our flesh, our tears, our death.", example:"For anyone in the depths of grief, depression, failure, or rejection — this verse is a lifeline. Many saints wrote of their 'dark nights of the soul,' and in the midst of them found that God had been nearest precisely when He seemed most absent." },
];

//  SAINTS 
const SAINTS = [
  { name:"Saint Henry II", feast:{m:7,d:13}, patron:["Holy Roman Empire","The Lame","Physically Challenged"], themes:["Humility","Service","Faith","Governance"], bio:"Holy Roman Emperor Henry II (973-1024) placed his kingdom at the service of the Church, founding monasteries and cathedrals across Europe. He and his wife Cunigunde both lived celibate lives as an act of consecration. Canonized in 1146.", quote:"Not to us, O Lord, not to us, but to your name give glory.", wikiTitle:"Henry_II,_Holy_Roman_Emperor" },
  { name:"Saint Kateri Tekakwitha", feast:{m:7,d:14}, patron:["Indigenous Peoples","Ecology","Canada"], themes:["Purity","Nature","Suffering","Faith"], bio:"Born in 1656 to a Mohawk father and Algonquin mother, Kateri was the first Native American canonized as a saint. Despite mockery and hardship, she lived a life of extraordinary holiness and love for God.", quote:"Who can tell me what is most pleasing to God that I may do it?", wikiTitle:"Kateri_Tekakwitha" },
  { name:"Saint Bonaventure", feast:{m:7,d:15}, patron:["Bowel Disorders","Workers"], themes:["Theology","Humility","Mysticism","Franciscan"], bio:"A Franciscan theologian and Doctor of the Church, Bonaventure balanced deep scholarship with profound mystical prayer. As Minister General he led the Franciscans with wisdom and humility.", quote:"The creature is a shadow, a road, a vestige — a glimpse of God.", wikiTitle:"Bonaventure" },
  { name:"Saint Camillus de Lellis", feast:{m:7,d:18}, patron:["Nurses","The Sick","Hospitals","Healthcare Workers"], themes:["Compassion","Service","Healing","Mercy"], bio:"A former soldier and compulsive gambler who converted and devoted his life to caring for the sick. He founded the Camillians and pioneered what we now call nursing best practices.", quote:"I wish for the strength of an angel to embrace and console the sick.", wikiTitle:"Camillus_de_Lellis" },
  { name:"Saint Mary Magdalene", feast:{m:7,d:22}, patron:["Penitent Women","Perfumers","Contemplatives"], themes:["Repentance","Devotion","Witness","Mercy"], bio:"The first witness of the Resurrection, called Apostle to the Apostles by the Church. Her devotion to Christ never wavered even at the foot of the Cross when the disciples had fled.", quote:"She stood outside the tomb weeping — and then she saw Him.", wikiTitle:"Mary_Magdalene" },
  { name:"Saint Ignatius of Loyola", feast:{m:7,d:31}, patron:["Jesuits","Soldiers","Retreatants","Educators"], themes:["Discernment","Mission","Discipline","Spiritual Exercises"], bio:"A Basque soldier whose battlefield conversion led him to found the Jesuits and develop the Spiritual Exercises, a structured retreat still used worldwide by millions.", quote:"Go forth and set the world on fire.", wikiTitle:"Ignatius_of_Loyola" },
  { name:"Saint Dominic", feast:{m:8,d:8}, patron:["Dominican Republic","Astronomers","Scientists"], themes:["Preaching","Truth","Poverty","Prayer"], bio:"Founded the Order of Preachers (Dominicans) to combat heresy through preaching and scholarship. He promoted the Rosary as a weapon of prayer and love.", quote:"Arm yourself with prayer rather than a sword; wear humility rather than fine clothes.", wikiTitle:"Dominic_de_Guzmán" },
  { name:"Saint Lawrence", feast:{m:8,d:10}, patron:["Deacons","Cooks","Brewers","Librarians"], themes:["Service","Martyrdom","Charity","Courage"], bio:"The archdeacon of Rome martyred in 258 AD, Lawrence was grilled alive on a gridiron. His witness of joy and charity in suffering became a beacon for the early Church.", quote:"I have given all — I have nothing left.", wikiTitle:"Lawrence_of_Rome" },
  { name:"Saint Clare of Assisi", feast:{m:8,d:11}, patron:["Television","Laundry Workers","Eye Disease"], themes:["Poverty","Contemplation","Courage","Community"], bio:"Inspired by Saint Francis, Clare founded the Order of Poor Ladies — the second Franciscan order. She lived a life of radical poverty and contemplation in San Damiano.", quote:"Our vocation is to aspire to the heights.", wikiTitle:"Clare_of_Assisi" },
  { name:"Blessed Virgin Mary", feast:{m:8,d:15}, patron:["All Christians","The Church","Mothers"], themes:["Faith","Humility","Intercession","Motherhood"], bio:"Mother of God, Queen of Heaven, first disciple of Christ. Mary's yes at the Annunciation opened the door of salvation. In Catholic tradition, she intercedes constantly for her children.", quote:"Do whatever he tells you.", wikiTitle:"Mary,_mother_of_Jesus" },
  { name:"Saint Monica", feast:{m:8,d:27}, patron:["Mothers","Wives","Victims of Abuse"], themes:["Mothers","Perseverance","Prayer","Hope"], bio:"Mother of Saint Augustine, Monica prayed and wept for her son's conversion for seventeen years. Her patient, faithful intercession is a model for all who pray for wayward loved ones.", quote:"Nothing is far from God.", wikiTitle:"Monica_of_Hippo" },
  { name:"Saint Augustine of Hippo", feast:{m:8,d:28}, patron:["Theologians","Brewers","Printers"], themes:["Conversion","Grace","Truth","Theology"], bio:"One of the greatest theologians in Church history, Augustine lived a dissolute youth before his dramatic conversion. His Confessions and City of God shaped Western Christianity profoundly.", quote:"Our heart is restless until it rests in Thee.", wikiTitle:"Augustine_of_Hippo" },
  { name:"Saint Gregory the Great", feast:{m:9,d:3}, patron:["Popes","Musicians","Teachers","Students"], themes:["Leadership","Service","Music","Reform"], bio:"One of the greatest popes in Church history, Gregory reformed the liturgy, codified Gregorian chant, cared personally for the poor, and sent Augustine to England to evangelize the Anglo-Saxons.", quote:"It is no great thing to be humble when brought low; but to be humble when praised is a great and rare achievement.", wikiTitle:"Pope_Gregory_I" },
  { name:"Saint Michael the Archangel", feast:{m:9,d:29}, patron:["Police Officers","Military","Paramedics","The Sick"], themes:["Protection","Courage","Spiritual Warfare","Justice"], bio:"Prince of the heavenly armies and protector of the Church. Michael appears in Scripture driving Satan from heaven, and tradition honors him as defender of souls and guide of the dying.", quote:"Who is like God?", wikiTitle:"Michael_(archangel)" },
  { name:"Saint Thérèse of Lisieux", feast:{m:10,d:1}, patron:["Missions","France","Florists","AIDS Sufferers"], themes:["Simplicity","Childhood","Suffering","Mission"], bio:"The Little Flower, who died at 24, is a Doctor of the Church. Her little way of spiritual childhood — trusting God completely in small things — has transformed millions of souls.", quote:"Miss no single opportunity of making some small sacrifice, here by a smiling look, there by a kindly word.", wikiTitle:"Thérèse_of_Lisieux" },
  { name:"Saint Francis of Assisi", feast:{m:10,d:4}, patron:["Animals","Ecology","Italy","Merchants"], themes:["Nature","Poverty","Peace","Animals"], bio:"Born into wealth in 13th-century Italy, Francis gave up everything to follow Christ radically. He founded the Franciscan Order, composed the Canticle of the Creatures, and received the stigmata.", quote:"Start by doing what is necessary, then what is possible, and suddenly you are doing the impossible.", wikiTitle:"Francis_of_Assisi" },
  { name:"Saint Faustina Kowalska", feast:{m:10,d:5}, patron:["Divine Mercy Devotion","Poland"], themes:["Mercy","Trust","Vision","Divine Mercy"], bio:"A Polish nun to whom Christ appeared and entrusted the message of Divine Mercy. Her Diary of Saint Maria Faustina Kowalska has become one of the most widely read spiritual books of the 20th century.", quote:"Jesus, I trust in You.", wikiTitle:"Faustina_Kowalska" },
  { name:"Saint Teresa of Avila", feast:{m:10,d:15}, patron:["Spain","Headache Sufferers","Chess Players"], themes:["Prayer","Mysticism","Interior Life","Reform"], bio:"A 16th-century Spanish Carmelite mystic and Doctor of the Church. Her Interior Castle remains one of the greatest works on contemplative prayer. She reformed the Carmelite Order with courage.", quote:"Let nothing disturb you, let nothing frighten you. All things pass. God never changes.", wikiTitle:"Teresa_of_Ávila" },
  { name:"Saint John Paul II", feast:{m:10,d:22}, patron:["Families","Youth","Poland"], themes:["Youth","Courage","Truth","Evangelization"], bio:"The beloved Polish pope who served for 27 years, survived an assassination attempt, and helped bring down communism through faith and diplomacy. His pontificate transformed the modern Church.", quote:"Be not afraid.", wikiTitle:"Pope_John_Paul_II" },
  { name:"Saint Stephen", feast:{m:12,d:26}, patron:["Deacons","Stonemasons","Bricklayers"], themes:["Martyrdom","Courage","Forgiveness","Witness"], bio:"The first martyr of Christianity, stoned to death for his witness to the Risen Christ. As he died, he prayed for his executioners — echoing Christ on the Cross. The young Saul watched.", quote:"I see the heavens opened and the Son of Man standing at the right hand of God.", wikiTitle:"Saint_Stephen" },
  { name:"Saint John the Apostle", feast:{m:12,d:27}, patron:["Theologians","Publishers","Asia Minor"], themes:["Love","Contemplation","Scripture","Faithfulness"], bio:"The Beloved Disciple who stood at the Cross and received the Blessed Mother into his care. Author of the fourth Gospel, three letters, and Revelation. His message: God is love.", quote:"God is love, and whoever abides in love abides in God.", wikiTitle:"John_the_Apostle" },
  { name:"Saint Thomas Aquinas", feast:{m:1,d:28}, patron:["Students","Scholars","Theologians","Universities"], themes:["Wisdom","Theology","Truth","Study"], bio:"The Angelic Doctor, Thomas was the greatest theologian of the medieval Church. Despite his brilliance, he described all his writings as straw compared to a single vision of God.", quote:"To one who has faith, no explanation is necessary.", wikiTitle:"Thomas_Aquinas" },
  { name:"Saint Joseph", feast:{m:3,d:19}, patron:["Universal Church","Workers","Fathers","Travelers"], themes:["Work","Family","Protection","Fatherhood"], bio:"The earthly father of Jesus and husband of Mary. A carpenter by trade, Joseph protected the Holy Family through the flight into Egypt and raised the Son of God in Nazareth with quiet, faithful love.", quote:"He did as the angel of the Lord commanded him.", wikiTitle:"Joseph_(husband_of_Mary)" },
  { name:"Saint Patrick", feast:{m:3,d:17}, patron:["Ireland","Nigeria","Engineers"], themes:["Mission","Courage","Trinity","Evangelization"], bio:"Captured as a slave in his youth and brought to Ireland, Patrick escaped and later returned as a missionary, evangelizing the entire island through faith, prayer, and love.", quote:"Christ with me, Christ before me, Christ behind me.", wikiTitle:"Saint_Patrick" },
  { name:"Saint Catherine of Siena", feast:{m:4,d:29}, patron:["Italy","Nurses","Firefighters","Europe"], themes:["Courage","Church","Mysticism","Reform"], bio:"A 14th-century laywoman and Doctor of the Church who convinced the Pope to return to Rome. Her letters and Dialogue remain classics of mystical theology.", quote:"Be who God meant you to be and you will set the world on fire.", wikiTitle:"Catherine_of_Siena" },
  { name:"Saint Peter", feast:{m:6,d:29}, patron:["Fishermen","Popes","Bakers","Locksmiths"], themes:["Leadership","Courage","Repentance","Faith"], bio:"The fisherman chosen by Christ as the rock of His Church. Despite his denials, Peter's repentance and restoration by the Risen Christ show that no failure is final in God's mercy.", quote:"Lord, you know everything. You know that I love you.", wikiTitle:"Saint_Peter" },
  { name:"Saint Paul the Apostle", feast:{m:6,d:29}, patron:["Missionaries","Theologians","Writers","Tentmakers"], themes:["Mission","Conversion","Courage","Suffering"], bio:"The persecutor turned apostle, Paul spread the Gospel across the known world through extraordinary suffering. His letters form a large portion of the New Testament.", quote:"I can do all things through Christ who strengthens me.", wikiTitle:"Paul_the_Apostle" },
  { name:"Saint Anthony of Padua", feast:{m:6,d:13}, patron:["Lost Items","The Poor","Travelers","Pregnant Women"], themes:["Lost Things","Preaching","Poverty","Scripture"], bio:"A Portuguese-born Franciscan renowned for powerful preaching and encyclopedic knowledge of Scripture. He is universally invoked for help finding lost items.", quote:"Actions speak louder than words; let your actions speak.", wikiTitle:"Anthony_of_Padua" },
  { name:"Blessed Virgin Mary (Apparition)", feast:{m:5,d:13}, patron:["All Christians","Portugal","Brazil"], themes:["Faith","Humility","Intercession","Fatima"], bio:"Our Lady of Fatima appeared to three shepherd children in 1917, calling for prayer, penance, and the consecration of Russia. The Fatima message continues to call the world to conversion.", quote:"Pray the Rosary every day to obtain peace for the world.", wikiTitle:"Our_Lady_of_Fátima" },
  { name:"Saint Francis Xavier", feast:{m:12,d:3}, patron:["Missionaries","Japan","India","Navarre"], themes:["Mission","Courage","Evangelization","Sacrifice"], bio:"The great Jesuit missionary baptized over thirty thousand people in India, the Malay Archipelago, and Japan. He died in 1552 on the island of Shanghuan, his eyes fixed on China.", quote:"Give me the grace, O Lord, to labor, to suffer, and not to count the cost.", wikiTitle:"Francis_Xavier" },
];

//  ROSARY 
const ROSARY = {
  Joyful:{day:"Mon & Sat",color:"#EAF4EC",border:"#7BB88A",decades:[
    {name:"The Annunciation",ref:"Luke 1:28",med:"The Angel Gabriel announces to Mary that she will conceive the Son of God. Mary's humble 'yes' opens the door of salvation for all humanity."},
    {name:"The Visitation",ref:"Luke 1:41",med:"Mary visits her cousin Elizabeth. The Holy Spirit fills the home with joy as two mothers meet and the unborn John leaps at the presence of Christ."},
    {name:"The Nativity",ref:"Luke 2:7",med:"The Son of God is born in a stable in Bethlehem. The King of Kings comes not in power but in poverty, revealing a love that stoops to meet us."},
    {name:"The Presentation",ref:"Luke 2:22",med:"Mary and Joseph present Jesus at the Temple. Simeon holds the child and sees in Him the light of the world, foretelling Mary's sorrow to come."},
    {name:"Finding in the Temple",ref:"Luke 2:46",med:"Jesus, lost for three days, is found in the Temple with the teachers. He reminds Mary and Joseph that He must be about His Father's business."},
  ]},
  Sorrowful:{day:"Tue & Fri",color:"#F5EBE8",border:"#C08878",decades:[
    {name:"Agony in the Garden",ref:"Luke 22:44",med:"Jesus sweats blood in Gethsemane, accepting the cup of suffering. In His anguish, He shows us how to surrender our will to the Father's."},
    {name:"Scourging at the Pillar",ref:"Isaiah 53:5",med:"Jesus is bound and scourged for our sins. His wounds become the source of our healing, as Isaiah foresaw centuries before."},
    {name:"Crowning with Thorns",ref:"Matthew 27:29",med:"A crown of thorns is pressed onto Christ's head in mockery. He who is King accepts humiliation to restore our dignity."},
    {name:"Carrying of the Cross",ref:"John 19:17",med:"Jesus carries the Cross to Calvary, falling three times. He shows us how to carry our own crosses with redemptive love."},
    {name:"The Crucifixion",ref:"John 19:30",med:"Jesus dies on the Cross, offering His life for the sins of all. 'It is finished' — the greatest act of love in all of history is complete."},
  ]},
  Glorious:{day:"Wed & Sun",color:"#EAF0F8",border:"#7898C8",decades:[
    {name:"The Resurrection",ref:"John 20:19",med:"Christ rises from the dead on the third day, victorious over sin and death. Every Easter morning, we celebrate the foundation of our entire faith."},
    {name:"The Ascension",ref:"Acts 1:9",med:"Jesus ascends to the Father in glory. He goes to prepare a place for us, and His departure makes possible the sending of the Spirit."},
    {name:"Descent of the Holy Spirit",ref:"Acts 2:4",med:"The Holy Spirit descends on Mary and the Apostles at Pentecost. The Church is born and frightened disciples go out to transform the world."},
    {name:"Assumption of Mary",ref:"Revelation 12:1",med:"At the end of her earthly life, Mary is assumed body and soul into heavenly glory — first fruits of the resurrection that awaits us all."},
    {name:"Coronation of Mary",ref:"Psalm 45:9",med:"Mary is crowned Queen of Heaven and Earth. As our Mother and Queen, she intercedes ceaselessly for her children."},
  ]},
  Luminous:{day:"Thursday",color:"#FBF4E4",border:"#C8A248",decades:[
    {name:"Baptism of Jesus",ref:"Matthew 3:17",med:"Jesus is baptized and the Father proclaims, 'This is my beloved Son.' The Trinity is revealed and our own baptism is given its ultimate meaning."},
    {name:"Wedding at Cana",ref:"John 2:5",med:"At Mary's intercession, Jesus performs His first miracle. Mary's words to the servants are her words to us: 'Do whatever he tells you.'"},
    {name:"Proclamation of the Kingdom",ref:"Mark 1:15",med:"Jesus calls all to repentance and announces the Kingdom of God. His healings and teachings reveal what the Kingdom looks like breaking into our world."},
    {name:"The Transfiguration",ref:"Matthew 17:2",med:"On Mount Tabor, Jesus reveals His divine glory to Peter, James, and John — strengthening them for the darkness of the Passion ahead."},
    {name:"Institution of the Eucharist",ref:"Luke 22:19",med:"At the Last Supper, Jesus gives us His Body and Blood. The source and summit of Catholic life is established forever."},
  ]},
};

//  NOVENAS 
const NOVENAS = [
  {
    id:"divine-mercy",
    title:"Divine Mercy Novena",
    subtitle:"Nine Days of Trust",
    color:"#F2EDF8",
    border:"#9060C0",
    accent:"#7040A0",
    description:"Given to Saint Faustina Kowalska, this novena begins on Good Friday and ends on Divine Mercy Sunday. Each day, Jesus asked her to bring different souls to His merciful Heart.",
    days:[
      {day:1,intention:"All Mankind, especially sinners",prayer:"Most Merciful Jesus, whose very nature it is to have compassion on us and to forgive us, do not look upon our sins but upon our trust which we place in Your infinite goodness. Receive us all into the abode of Your Most Compassionate Heart, and never let us escape from It. Eternal Father, turn Your merciful gaze upon all mankind and especially poor sinners, all enfolded in the Most Compassionate Heart of Jesus. Amen."},
      {day:2,intention:"Priests and Religious",prayer:"Most Merciful Jesus, from whom comes all that is good, increase Your grace in men and women consecrated to Your service, that they may perform worthy works of mercy. Amen."},
      {day:3,intention:"Devout and Faithful Souls",prayer:"Most Merciful Jesus, from the treasury of Your mercy, You impart Your graces in great abundance to each and all. Receive us into the abode of Your Most Compassionate Heart and never let us escape from It. Amen."},
      {day:4,intention:"Pagans and Those Who Do Not Know God",prayer:"Most Merciful Jesus, You are the Light of the whole world. Receive into the abode of Your Most Compassionate Heart the souls of those who do not believe in God. Let the rays of Your grace enlighten them. Amen."},
      {day:5,intention:"Heretics and Schismatics",prayer:"Most Merciful Jesus, Goodness Itself, You do not refuse light to those who seek it of You. Draw them by Your light into the unity of the Church. Amen."},
      {day:6,intention:"Meek and Humble Souls",prayer:"Most Merciful Jesus, You yourself have said: 'Learn from Me, for I am meek and humble of heart.' Receive into the abode of Your Most Compassionate Heart all meek and humble souls and the souls of little children. Amen."},
      {day:7,intention:"Souls Who Venerate Divine Mercy",prayer:"Most Merciful Jesus, whose Heart is Love Itself, receive into the abode of Your Most Compassionate Heart the souls of those who particularly extol and venerate the greatness of Your mercy. Amen."},
      {day:8,intention:"Souls Detained in Purgatory",prayer:"Most Merciful Jesus, may the streams of Blood and Water which gushed forth from Your Heart put out the flames of Purgatory. Amen."},
      {day:9,intention:"Lukewarm Souls",prayer:"Most Compassionate Jesus, in this fire of Your pure love, let these tepid souls be once again set aflame. Amen."},
    ]
  },
  {
    id:"our-lady-guadalupe",
    title:"Novena to Our Lady of Guadalupe",
    subtitle:"Mother of the Americas",
    color:"#EDF5EE",
    border:"#4A9A5A",
    accent:"#2E7A3E",
    description:"Prayed in preparation for the Feast of Our Lady of Guadalupe (December 12), or anytime seeking her maternal intercession.",
    days:[
      {day:1,intention:"Trust in God's Providence",prayer:"Our Lady of Guadalupe, mystical rose, make intercession for Holy Mother Church, protect the Sovereign Pontiff, help all those who invoke thee in their necessities. Amen."},
      {day:2,intention:"For the Poor and Forgotten",prayer:"O Mary, you appeared to Juan Diego, a humble man of the people. Intercede for all who feel forgotten. May they know they are precious in God's sight. Amen."},
      {day:3,intention:"For Families",prayer:"Mother of Guadalupe, protect our homes, heal our wounds, and unite us in love. May every family find in you a model of faith. Amen."},
      {day:4,intention:"For the Sick",prayer:"Our Lady of Guadalupe, 'Am I not here who am your Mother?' Bring comfort to all who are sick in body or soul. Amen."},
      {day:5,intention:"For Vocations",prayer:"O Virgin of Guadalupe, raise up holy priests and consecrated souls. May many hearts hear God's call and respond with generosity. Amen."},
      {day:6,intention:"For the Conversion of Sinners",prayer:"Most holy Virgin, your image has brought millions to faith. Intercede for those who are far from God. Amen."},
      {day:7,intention:"For Peace",prayer:"Mother of peace, obtain from your Son the gift of true peace — in our hearts, in our families, in our nations. Amen."},
      {day:8,intention:"For the Dying",prayer:"Our Lady of Guadalupe, be present at the hour of death to all who have sought your intercession. Lead them gently to the arms of your Son. Amen."},
      {day:9,intention:"Thanksgiving and Consecration",prayer:"O Most Holy Virgin of Guadalupe, I consecrate to you my mind, my heart, and my will. Thank you for your maternal love. Amen."},
    ]
  },
  {
    id:"sacred-heart",
    title:"Novena to the Sacred Heart",
    subtitle:"Nine Days of Love",
    color:"#F8ECEC",
    border:"#C06060",
    accent:"#A04040",
    description:"Traditionally prayed before the Feast of the Sacred Heart of Jesus.",
    days:[
      {day:1,intention:"For Love of God",prayer:"O my Jesus, You have said: 'Ask and it will be given you.' Behold I ask for the grace of loving You above all things. Sacred Heart of Jesus, I place my trust in You. Amen."},
      {day:2,intention:"For Purity of Heart",prayer:"O Sacred Heart of Jesus, I offer You my heart. Purify it of all that is not of You. Amen."},
      {day:3,intention:"For the Church",prayer:"Sacred Heart of Jesus, protect Your Church, purify her, and fill her ministers with the fire of Your love. Amen."},
      {day:4,intention:"For Families in Crisis",prayer:"O Heart of Jesus, burning with love for us, heal every family broken by sin, sorrow, or separation. Amen."},
      {day:5,intention:"For Sinners",prayer:"Most Sacred Heart of Jesus, be the refuge of all who have wandered far from You. Amen."},
      {day:6,intention:"For the Dying",prayer:"Sacred Heart of Jesus, be with all who are at the threshold of death. May they pass with trust in Your mercy. Amen."},
      {day:7,intention:"For Priests",prayer:"O Heart of Jesus, eternal High Priest, sanctify all your priests. May they be men after Your own Heart. Amen."},
      {day:8,intention:"For the Suffering",prayer:"Gentle Heart of Jesus, let all who suffer feel Your heartbeat close to theirs. Amen."},
      {day:9,intention:"Final Consecration",prayer:"O Sacred Heart of Jesus, to You I consecrate and offer up my person and my life. This is my resolution, made with the help of Your grace. Amen."},
    ]
  },
  {
    id:"saint-joseph",
    title:"Novena to Saint Joseph",
    subtitle:"Patron of the Universal Church",
    color:"#EDF4EE",
    border:"#6A9A6A",
    accent:"#3A7A3A",
    description:"Saint Joseph is the patron of the Universal Church, workers, fathers, and a happy death.",
    days:[
      {day:1,intention:"For Fatherhood and Family",prayer:"O Glorious Saint Joseph, I choose you today as my patron and advocate. Pray for my family, that we may imitate the Holy Family of Nazareth. Amen."},
      {day:2,intention:"For Humility",prayer:"Saint Joseph, you were chosen above all men yet you remained hidden and humble. Obtain for me the gift of true humility. Amen."},
      {day:3,intention:"For Trust in Dark Times",prayer:"O Saint Joseph, you did not understand God's plan but you obeyed. When I face confusion, give me your trusting heart. Amen."},
      {day:4,intention:"For Workers and the Poor",prayer:"Saint Joseph, carpenter of Nazareth, bless all who work and all who struggle to provide for their families. Amen."},
      {day:5,intention:"For Purity",prayer:"O chaste guardian of the Virgin, obtain for me a heart pure and faithful. Amen."},
      {day:6,intention:"For the Church",prayer:"Saint Joseph, patron of the Universal Church, watch over her as you watched over the Holy Child Jesus. Amen."},
      {day:7,intention:"For the Dying",prayer:"O patron of a happy death, be with all who are dying this day. Lead them gently home. Amen."},
      {day:8,intention:"For Courage",prayer:"Mighty Saint Joseph, be my defender in the spiritual battles of life. Stand at my side as you stood guard over Jesus and Mary. Amen."},
      {day:9,intention:"Thanksgiving",prayer:"Glorious Saint Joseph, thank you for your intercession, your example, and your quiet, powerful love. Amen."},
    ]
  },
];

//  THREE O'CLOCK PRAYER 
const THREE_OCLOCK_PRAYER = {
  title:"The Three O'Clock Hour",
  subtitle:"Hour of Mercy",
  instruction:"At three o'clock, implore My mercy, especially for sinners; and, if only for a brief moment, immerse yourself in My Passion, particularly in My abandonment at the moment of agony. This is the hour of great mercy for the whole world. — Jesus to Saint Faustina",
  shortPrayer:"You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us.",
  chaplet:"V. You expired, O Jesus, but the source of life gushed forth for souls and the ocean of mercy opened up for the whole world.\nR. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us.\n\nFor the sake of His sorrowful Passion, have mercy on us and on the whole world. (×3)\n\nO Blood and Water, which gushed forth from the Heart of Jesus as a font of mercy for us, I trust in You!",
  ccc:"The Catechism of the Catholic Church teaches that prayer is a vital necessity (CCC 2744). The Three O'Clock Hour is a devotion rooted in the hour of Christ's death on the Cross, transforming the moment of His greatest suffering into a perpetual fountain of grace for all who turn to Him with trust.",
};

//  CATEGORIES 
const CATEGORIES = [
  {id:"peace",label:"Peace",sym:""},{id:"hope",label:"Hope",sym:""},
  {id:"love",label:"Love",sym:""},{id:"strength",label:"Strength",sym:""},
  {id:"comfort",label:"Comfort",sym:""},{id:"trust",label:"Trust",sym:""},
  {id:"grief",label:"Grief",sym:""},{id:"healing",label:"Healing",sym:""},
  {id:"faith",label:"Faith",sym:""},{id:"mercy",label:"Mercy",sym:""},
  {id:"wisdom",label:"Wisdom",sym:""},{id:"renewal",label:"Renewal",sym:""},
];

//  ALL BOOKS OF THE CATHOLIC BIBLE 
const BIBLE_BOOKS = {
  OT: ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Tobit","Judith","Esther","1 Maccabees","2 Maccabees","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Wisdom","Sirach","Isaiah","Jeremiah","Lamentations","Baruch","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"],
  NT: ["Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"],
};

//  HELPERS 
function getDailyVerse() {
  const day = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/86400000);
  return VERSES[day%VERSES.length];
}
function getSaintOfDay() {
  const now = new Date(); const m=now.getMonth()+1, d=now.getDate();
  // First: exact feast day match for today
  const exact = SAINTS.find(s=>s.feast.m===m&&s.feast.d===d);
  if (exact) return exact;
  // Second: find the most recent feast day in the past 7 days
  for (let i=1; i<=7; i++) {
    const past = new Date(now); past.setDate(past.getDate()-i);
    const pm=past.getMonth()+1, pd=past.getDate();
    const recent = SAINTS.find(s=>s.feast.m===pm&&s.feast.d===pd);
    if (recent) return recent;
  }
  // Fallback: rotation by day of year
  const day = Math.floor((Date.now()-new Date(now.getFullYear(),0,0))/86400000);
  return SAINTS[day%SAINTS.length];
}
function getEaster(y) {
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),dy=((h+l-7*m+114)%31)+1;
  return new Date(y,mo-1,dy);
}
function getLiturgicalSeason() {
  const now=new Date(),y=now.getFullYear();
  const easter=getEaster(y);
  const ashWed=new Date(easter); ashWed.setDate(ashWed.getDate()-46);
  const pentecost=new Date(easter); pentecost.setDate(pentecost.getDate()+49);
  const christmas=new Date(y,11,25);
  const advent=new Date(y,11,25); const dow=advent.getDay(); advent.setDate(advent.getDate()-(dow===0?21:dow+21));
  const n=now.getTime();
  if(n>=advent.getTime()&&n<christmas.getTime()) return {name:"Advent",bg:"#F0EAF8",border:"#8A60C0",light:"#6A40A0",desc:"A time of hopeful waiting and preparation for the coming of Christ.",cats:["hope","faith","trust"]};
  if((now.getMonth()===11&&now.getDate()>=25)||(now.getMonth()===0&&now.getDate()<13)) return {name:"Christmas",bg:"#EAF0FA",border:"#5A80C0",light:"#3A60A8",desc:"We celebrate the Incarnation — God becoming man for our salvation.",cats:["love","hope","faith"]};
  if(n>=ashWed.getTime()&&n<easter.getTime()) return {name:"Lent",bg:"#F5F0E8",border:"#9A8058",light:"#7A6040",desc:"Forty days of prayer, fasting, and almsgiving as we journey toward Easter.",cats:["grief","trust","renewal"]};
  if(n>=easter.getTime()&&n<pentecost.getTime()) return {name:"Easter",bg:"#EAF6EC",border:"#4A9A5A",light:"#2E7A3E",desc:"Fifty days of rejoicing in the Resurrection of Our Lord Jesus Christ.",cats:["hope","renewal","faith"]};
  return {name:"Ordinary Time",bg:"#EAF4EE",border:"#5A9A6A",light:"#3A7A4A",desc:"The Church invites us to grow in faith, hope, and love through the teachings of Christ.",cats:["wisdom","trust","love"]};
}
function isThreeOClockHour() { return new Date().getHours() === 15; }

//  ICONS 
const Cross=({size=20})=><svg width={size} height={size} viewBox="0 0 20 20" fill="none"><rect x="8.5" y="2" width="3" height="16" rx="1" fill={GOLD}/><rect x="2" y="7.5" width="16" height="3" rx="1" fill={GOLD}/></svg>;
const HomeIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 9v11h5v-6h6v6h5V9L11 2z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>;
const ChatIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H8l-5 4V5z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>;
const BookIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4a2 2 0 012-2h10a2 2 0 012 2v14l-7-3-7 3V4z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>;
const PrayIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none"/><circle cx="11" cy="11" r="3" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none"/><line x1="11" y1="3" x2="11" y2="8" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/><line x1="11" y1="14" x2="11" y2="19" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/><line x1="3" y1="11" x2="8" y2="11" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/><line x1="14" y1="11" x2="19" y2="11" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/></svg>;
const MassIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="5" width="18" height="13" rx="2" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none"/><path d="M9 9l5 2.5L9 14V9z" fill={on?GOLD:"#B8A898"}/><line x1="7" y1="2" x2="7" y2="5" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" strokeLinecap="round"/><line x1="15" y1="2" x2="15" y2="5" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const RefreshIco=()=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 0110.7-3.7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><path d="M14 8a6 6 0 01-10.7 3.7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><polyline points="13,3.5 13,7 9.5,7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3,12.5 3,9 6.5,9" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SendIco=()=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9l14-7-7 14V9H2z" fill={GOLD}/></svg>;
const HeartIco=({filled})=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15S2 10.5 2 5.5A3.5 3.5 0 019 3.7 3.5 3.5 0 0116 5.5C16 10.5 9 15 9 15z" stroke={filled?GOLD:"#B8A898"} strokeWidth="1.5" fill={filled?GOLD:"none"}/></svg>;
const ChevIco=({dir="right"})=><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:dir==="left"?"rotate(180deg)":"none"}}><path d="M5 3l4 4-4 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const BellIco=({on})=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2a5 5 0 00-5 5v4l-1.5 2h13L14 11V7a5 5 0 00-5-5z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none"/><path d="M7 15a2 2 0 004 0" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/></svg>;
const Pill=({label})=><span style={{fontSize:13,background:SURFACE,color:GOLD,padding:"3px 10px",borderRadius:20,letterSpacing:"0.04em",fontFamily:"'Lato',sans-serif",display:"inline-block",border:`1px solid ${BORDER}`}}>{label}</span>;
const LockIco=()=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="8" width="12" height="9" rx="2" stroke={GOLD} strokeWidth="1.5"/><path d="M6 8V5.5a3 3 0 016 0V8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="12.5" r="1.5" fill={GOLD}/></svg>;

//  VERSE CARD 
function VerseCard({verse,expanded,onToggle,isFav,onFav}) {
  return (
    <div onClick={onToggle} style={{background:CARD,border:`1px solid ${expanded?GOLD+"88":BORDER}`,borderRadius:18,padding:20,cursor:"pointer",transition:"all 0.2s",boxShadow:expanded?CARD_SHADOW_STRONG:CARD_SHADOW}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,lineHeight:1.9,marginBottom:12,letterSpacing:"0.04em",fontWeight:600,textShadow:EMBOSS}}>"{verse.text}"</div>
          <div style={{fontSize:14,color:GOLD,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:CINZEL}}>{verse.ref}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:14,color:MUTED}}>{expanded?"":""}</span>
          <div onClick={e=>{e.stopPropagation();onFav(verse.id);}}><HeartIco filled={isFav}/></div>
        </div>
      </div>
      {expanded&&(
        <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
          <p style={{fontSize:16,color:CREAM,lineHeight:1.85,marginBottom:14}}>{verse.explanation}</p>
          {verse.example&&(
            <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 8px 8px 0",padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:13,color:GOLD,fontWeight:700,letterSpacing:"0.14em",marginBottom:6,textTransform:"uppercase",fontFamily:CINZEL}}>In Practice</div>
              <p style={{fontSize:15,color:MUTED,lineHeight:1.78}}>{verse.example}</p>
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{verse.category.map(c=><Pill key={c} label={c}/>)}</div>
        </div>
      )}
    </div>
  );
}

// ─── NOTIFICATION PERMISSION POPUP ───────────────────────────────────────────
function NotificationBanner({ onGranted, onDismiss })
// ─── PWA INSTALL POPUP ───────────────────────────────────────────────────────
function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 900, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 24px", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }}>
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 24, padding: 24, width: "calc(100% - 32px)", maxWidth: 414, boxShadow: CARD_SHADOW_STRONG }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <img src="/icon-192.png" alt="Verbum" style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: CINZEL, fontSize: 18, color: WHITE, fontWeight: 700, letterSpacing: "0.06em", textShadow: EMBOSS, marginBottom: 3 }}>Add Verbum to Home Screen</div>
            <p style={{ fontSize: 13, color: MUTED, fontFamily: "'Lato',sans-serif", fontWeight: 500, lineHeight: 1.5 }}>Quick access, offline support, and push notifications.</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onInstall} style={{ flex: 1, background: `linear-gradient(135deg,${GOLD},${GOLD_BRIGHT})`, border: "none", borderRadius: 14, padding: "13px", color: "#FFFFFF", fontSize: 15, fontFamily: CINZEL, fontWeight: 600, letterSpacing: "0.07em", cursor: "pointer" }}>
            Add to Home Screen
          </button>
          <button onClick={onDismiss} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "13px 16px", color: MUTED, fontSize: 14, cursor: "pointer", fontFamily: "'Lato',sans-serif" }}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

//  PAID USER WARNING MODAL 
function PaidUserModal({ onClose, onProceed }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",background:"rgba(200,180,150,0.5)",backdropFilter:"blur(8px)"}}>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:24,padding:32,maxWidth:360,width:"100%",position:"relative",boxShadow:`0 8px 40px rgba(0,0,0,0.12)`}}>
        <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",width:120,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,borderRadius:2}}/>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`${GOLD}15`,border:`1.5px solid ${GOLD}50`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><LockIco/></div>
          <div style={{fontFamily:CINZEL,fontSize:20,color:WHITE,fontWeight:600,letterSpacing:"0.08em",marginBottom:8,textShadow:EMBOSS}}>Soul Check</div>
          <div style={{fontSize:13,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:16}}>Premium Feature</div>
          <p style={{fontSize:16,color:CREAM,lineHeight:1.85,fontFamily:"'Lato',sans-serif"}}>Soul Check is available to <strong style={{color:WHITE}}>Verbum Premium</strong> subscribers.</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={onProceed} style={{width:"100%",background:`linear-gradient(135deg,${GOLD},#B8923C)`,border:"none",borderRadius:14,padding:"13px",color:"#FFFFFF",fontSize:16,fontFamily:CINZEL,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer"}}>Upgrade to Premium</button>
          <button onClick={onClose} style={{width:"100%",background:"none",border:`1px solid ${BORDER}`,borderRadius:14,padding:"12px",color:MUTED,fontSize:15,fontFamily:"'Lato',sans-serif",cursor:"pointer"}}>Continue as Free User</button>
        </div>
      </div>
    </div>
  );
}

//  THREE O'CLOCK BANNER 
function ThreeOClockBanner() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{background:"linear-gradient(135deg,#F5EEF8,#EDE0F5)",border:`1px solid #9B59C0`,borderRadius:18,padding:18,marginBottom:14,position:"relative",overflow:"hidden",boxShadow:"0 4px 16px rgba(155,89,192,0.12)"}}>
      <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(155,89,192,0.05)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:19}}></span></div>
        <div>
          <div style={{fontFamily:CINZEL,fontSize:16,color:"#4A2070",fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS}}>The Three O'Clock Hour</div>
          <div style={{fontSize:13,color:"#7040A0",letterSpacing:"0.14em",fontFamily:CINZEL,textTransform:"uppercase"}}>Hour of Mercy</div>
        </div>
      </div>
      <p style={{fontSize:15,color:"#6A4080",lineHeight:1.78,fontFamily:"'Lato',sans-serif",marginBottom:12}}>This is the Hour of Mercy — the hour of Christ's death on the Cross. Pause for a moment of prayer.</p>
      <div style={{fontFamily:CINZEL,fontSize:14,color:"#4A2870",lineHeight:2.0,letterSpacing:"0.04em",textShadow:EMBOSS,marginBottom:12,fontStyle:"italic"}}>"{THREE_OCLOCK_PRAYER.shortPrayer}"</div>
      {!expanded&&<button onClick={()=>setExpanded(true)} style={{background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.3)",borderRadius:10,padding:"8px 14px",color:"#7040A0",fontSize:14,cursor:"pointer",fontFamily:CINZEL,letterSpacing:"0.07em"}}>+ Full Chaplet of Mercy</button>}
      {expanded&&(
        <div style={{background:"rgba(155,89,192,0.06)",borderRadius:12,padding:14,marginTop:4,border:"1px solid rgba(155,89,192,0.15)"}}>
          <div style={{fontFamily:CINZEL,fontSize:13,color:"#7040A0",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Divine Mercy Chaplet</div>
          <div style={{fontFamily:CINZEL,fontSize:14,color:"#4A2870",lineHeight:2.1,letterSpacing:"0.03em",whiteSpace:"pre-line",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.chaplet}</div>
          <button onClick={()=>setExpanded(false)} style={{marginTop:12,background:"none",border:"none",color:MUTED,fontSize:14,cursor:"pointer",fontFamily:"'Lato',sans-serif"}}> Close</button>
        </div>
      )}
    </div>
  );
}

//  DAILY CATHOLIC HAPPENING 
function DailyCatholicHappening() {
  // Static Catholic Calendar — one entry per day of year, cycling through key feasts and moments
  const HAPPENINGS = [
    { month:1,  day:1,  emoji:"M", title:"Solemnity of Mary", type:"Feast Day", year:"", body:"The Church begins each new year under the mantle of Mary, Mother of God. This solemnity, one of the oldest Marian feasts, celebrates her divine motherhood proclaimed at the Council of Ephesus in 431 AD.", ccc:"The Catechism teaches that Mary's divine motherhood is the reason for all her other privileges (CCC 495)." },
    { month:1,  day:6,  emoji:"S", title:"The Epiphany of the Lord", type:"Feast Day", year:"", body:"The Magi follow the star to Bethlehem, presenting gold, frankincense, and myrrh to the Christ Child. The Epiphany reveals Jesus as the Savior of all nations, not Israel alone.", ccc:"The CCC presents the Epiphany as the manifestation of Jesus as Messiah of Israel, Son of God, and Savior of the world (CCC 528)." },
    { month:1,  day:13, emoji:"B", title:"Baptism of the Lord", type:"Feast Day", year:"", body:"At the Jordan River, Jesus is baptized by John, and the Trinity is revealed: the Father speaks, the Spirit descends as a dove, and the Son is immersed. This event inaugurates His public ministry.", ccc:"The CCC teaches that Jesus' baptism is a prefiguring of our own, and that He sanctifies the waters for all Christian baptism (CCC 536)." },
    { month:1,  day:28, emoji:"T", title:"Feast of Saint Thomas Aquinas", type:"Feast Day", year:"1274", body:"The Angelic Doctor, Thomas Aquinas, synthesized faith and reason in his monumental Summa Theologiae, still the foundation of Catholic philosophical theology. Despite his brilliance, he described all his writings as straw compared to God.", ccc:"The CCC draws extensively on Aquinas, reflecting his teaching that faith and reason are complementary paths to truth (CCC 159)." },
    { month:2,  day:2,  emoji:"C", title:"Presentation of the Lord", type:"Feast Day", year:"", body:"Mary and Joseph present the infant Jesus at the Temple, fulfilling the Law. The elderly Simeon holds the child and proclaims him the light of the nations, foretelling the sword that will pierce Mary's heart.", ccc:"The CCC sees the Presentation as a sign of Jesus' complete dedication to the Father and His acceptance of the Cross (CCC 529)." },
    { month:2,  day:11, emoji:"M", title:"Our Lady of Lourdes", type:"Marian Apparition", year:"1858", body:"In 1858, the Blessed Virgin Mary appeared eighteen times to fourteen-year-old Bernadette Soubirous in Lourdes, France, identifying herself as the Immaculate Conception. The shrine at Lourdes has since received over 200 million pilgrims.", ccc:"The CCC affirms that private revelations like Lourdes can help us live the faith more fully, though they do not add to the deposit of faith (CCC 67)." },
    { month:2,  day:22, emoji:"P", title:"Chair of Saint Peter", type:"Feast Day", year:"", body:"The Church celebrates the authority given to Peter and his successors. The physical chair (cathedra) of Peter in St. Peter's Basilica symbolizes the teaching authority of the Pope — the Magisterium in its fullest expression.", ccc:"The CCC teaches that the Bishop of Rome, as successor of Peter, has full, supreme, and universal power over the whole Church (CCC 882)." },
    { month:3,  day:4,  emoji:"C", title:"Feast of Saint Casimir", type:"Feast Day", year:"1484", body:"A Polish prince who renounced a throne offered to him in order to live a life of prayer, fasting, and charity. He is patron of Poland and Lithuania, and a model of how holiness can flourish in the midst of royal power.", ccc:"The CCC teaches that the call to holiness is universal and extends to every state of life, including rulers and those in positions of power (CCC 2105)." },
    { month:3,  day:17, emoji:"P", title:"Feast of Saint Patrick", type:"Feast Day", year:"461", body:"Captured as a slave from Britain and brought to Ireland, Patrick later returned as a missionary bishop who evangelized the entire island. His Confessions reveal a man of extraordinary faith shaped by suffering.", ccc:"The CCC highlights the missionary character of the Church — every baptized person is called to share the faith as Patrick did (CCC 849)." },
    { month:3,  day:19, emoji:"J", title:"Solemnity of Saint Joseph", type:"Feast Day", year:"", body:"Joseph, the earthly father of Jesus and husband of Mary, is patron of the Universal Church, workers, fathers, and a happy death. His silent faithfulness in Scripture — he never speaks a single recorded word — has made him a model of humble obedience.", ccc:"The CCC honors Joseph as the one entrusted by God with the guardianship of the Holy Family (CCC 1014)." },
    { month:3,  day:25, emoji:"A", title:"The Annunciation of the Lord", type:"Feast Day", year:"", body:"The Angel Gabriel appears to Mary in Nazareth and announces that she will conceive the Son of God by the Holy Spirit. Mary's fiat — let it be done to me — is the pivotal moment of salvation history.", ccc:"The CCC calls the Annunciation the moment the Eternal Son of God became incarnate in the womb of the Virgin Mary (CCC 484)." },
    { month:4,  day:2,  emoji:"J", title:"Memorial of Saint John Paul II", type:"Papal Event", year:"2005", body:"Karol Wojtyla of Poland became Pope John Paul II in 1978, serving for 27 years. He traveled to 129 countries, survived an assassination attempt, canonized more saints than all his predecessors combined, and helped bring down communism through faith and diplomacy.", ccc:"His encyclical Veritatis Splendor reaffirmed the CCC's teaching on the objectivity of moral truth (CCC 1956)." },
    { month:4,  day:13, emoji:"M", title:"Memorial of Saint Martin I", type:"Martyrdom", year:"655", body:"Pope Martin I was the last pope to be martyred, exiled to Crimea by the Byzantine Emperor Constans II for defending orthodox Christology against the Monothelite heresy. He died of mistreatment and starvation, yet his final letters radiate joy.", ccc:"The CCC affirms that the martyrs give the supreme witness to the truth of the faith (CCC 2473)." },
    { month:4,  day:23, emoji:"G", title:"Feast of Saint George", type:"Feast Day", year:"303", body:"A Roman soldier martyred for his Christian faith around 303 AD, George became one of the most venerated saints in both East and West. The dragon legend, a medieval allegory, symbolizes the victory of faith over evil.", ccc:"The CCC honors the martyrs as those who by their death gave the most perfect witness to the truth (CCC 2506)." },
    { month:4,  day:29, emoji:"C", title:"Feast of Saint Catherine of Siena", type:"Feast Day", year:"1380", body:"A Dominican tertiary and Doctor of the Church, Catherine convinced Pope Gregory XI to return from Avignon to Rome in 1377. Her Dialogue and her letters remain classics of Catholic mystical theology.", ccc:"Her life embodies the CCC's teaching that holiness and prophetic witness are inseparable charisms in the Church (CCC 798)." },
    { month:5,  day:1,  emoji:"J", title:"Feast of Saint Joseph the Worker", type:"Feast Day", year:"", body:"Pope Pius XII established this feast in 1955 to honor the dignity of human labor through the patron of workers. Joseph's carpenter shop in Nazareth sanctified ordinary work for all time.", ccc:"The CCC teaches that work is a participation in the Creator's activity and a means of sanctification (CCC 2427)." },
    { month:5,  day:13, emoji:"F", title:"Our Lady of Fatima", type:"Marian Apparition", year:"1917", body:"From May to October 1917, Mary appeared six times to three shepherd children — Lucia, Francisco, and Jacinta — in Fatima, Portugal. She called for prayer, penance, and the consecration of Russia.", ccc:"The CCC teaches that Fatima belongs to the tradition of private revelations that can assist the faithful in living the faith (CCC 67)." },
    { month:5,  day:31, emoji:"V", title:"Visitation of the Blessed Virgin Mary", type:"Feast Day", year:"", body:"Mary travels to visit her elderly cousin Elizabeth after the Annunciation. At Mary's greeting, the unborn John the Baptist leaps with joy, and Elizabeth proclaims Mary blessed among women. The Magnificat pours forth from Mary's lips.", ccc:"The CCC presents the Visitation as a moment when the Holy Spirit fills Elizabeth through Mary's greeting (CCC 717)." },
    { month:6,  day:3,  emoji:"U", title:"Feast of the Uganda Martyrs", type:"Martyrdom", year:"1886", body:"Twenty-two Catholic young men were martyred in Uganda in 1886 on the orders of King Mwanga, refusing to abandon their faith or submit to sexual abuse. They are the first canonized martyrs of sub-Saharan Africa.", ccc:"The CCC affirms that martyrdom is the supreme witness to the truth of faith and a participation in the Cross of Christ (CCC 2473)." },
    { month:6,  day:13, emoji:"A", title:"Feast of Saint Anthony of Padua", type:"Feast Day", year:"1231", body:"A Franciscan friar renowned for powerful preaching and encyclopedic knowledge of Scripture, Anthony died at 35 yet is one of the most beloved saints in the world. He is invoked for help finding lost items.", ccc:"The CCC honors the preaching office as a primary means by which the Gospel is transmitted through the generations (CCC 2033)." },
    { month:6,  day:24, emoji:"J", title:"Birth of Saint John the Baptist", type:"Feast Day", year:"", body:"One of only three birthdays the Church celebrates — the others being Our Lord and Our Lady — this feast honors John, the last of the prophets and the voice crying in the wilderness to prepare the way of the Lord.", ccc:"The CCC teaches that John the Baptist is the greatest of the prophets and the herald who announces Christ's arrival (CCC 523)." },
    { month:6,  day:29, emoji:"P", title:"Solemnity of Saints Peter and Paul", type:"Feast Day", year:"", body:"The twin pillars of the Church are honored together on this solemnity. Peter, the fisherman made a rock; Paul, the persecutor made an apostle. Both were martyred in Rome and their witness built the universal Church.", ccc:"The CCC teaches that the apostolic succession continues from Peter and Paul through their successors, the bishops (CCC 861)." },
    { month:7,  day:11, emoji:"B", title:"Feast of Saint Benedict", type:"Feast Day", year:"547", body:"The father of Western monasticism, Benedict wrote his Rule in the 6th century — a balanced guide to prayer and work that shaped European civilization. His motto, Ora et Labora, remains a summary of the contemplative life.", ccc:"The CCC honors the monastic life as a special form of participation in the mystery of Christ's prayer and service (CCC 916)." },
    { month:7,  day:22, emoji:"M", title:"Feast of Saint Mary Magdalene", type:"Feast Day", year:"", body:"The Apostle to the Apostles, Mary Magdalene was the first to see the Risen Christ and the first to announce His resurrection. Pope Francis elevated her feast to the rank of feast in 2016, honoring her missionary role.", ccc:"The CCC affirms that Mary Magdalene represents the primacy of love and personal encounter with the Risen Lord (CCC 641)." },
    { month:7,  day:25, emoji:"J", title:"Feast of Saint James the Apostle", type:"Feast Day", year:"44", body:"The first apostle to be martyred, James was beheaded by King Herod Agrippa around 44 AD. His shrine at Santiago de Compostela in Spain has been one of the great pilgrimage destinations of Christendom for over a thousand years.", ccc:"The CCC honors the apostolic witness as the foundation on which the Church is built (CCC 857)." },
    { month:7,  day:31, emoji:"I", title:"Feast of Saint Ignatius of Loyola", type:"Feast Day", year:"1556", body:"A Spanish Basque soldier whose conversion after battlefield injury led him to found the Society of Jesus (Jesuits) and develop the Spiritual Exercises, a systematic method of prayer still used worldwide by millions.", ccc:"The CCC affirms that the particular charism of religious institutes like the Jesuits enriches the Church's holiness (CCC 914)." },
    { month:8,  day:6,  emoji:"T", title:"Transfiguration of the Lord", type:"Feast Day", year:"", body:"On Mount Tabor, Jesus is transfigured before Peter, James, and John — His face shining like the sun and His garments white as light. Moses and Elijah appear beside Him. This event strengthens the disciples for the coming Passion.", ccc:"The CCC teaches that the Transfiguration is an anticipation of the resurrection and the glory to which Christ calls His disciples (CCC 555)." },
    { month:8,  day:9,  emoji:"E", title:"Feast of Saint Teresa Benedicta of the Cross", type:"Martyrdom", year:"1942", body:"Edith Stein, a Jewish philosopher who converted to Catholicism and became a Carmelite nun, was martyred at Auschwitz in 1942. Her life is a bridge between the Jewish and Christian traditions and a witness to love in the face of evil.", ccc:"The CCC teaches that the Church honors those who gave their lives in witness to the faith across every era and culture (CCC 2473)." },
    { month:8,  day:15, emoji:"A", title:"Assumption of the Blessed Virgin Mary", type:"Feast Day", year:"", body:"At the end of her earthly life, Mary was taken up body and soul into heavenly glory. Defined as dogma by Pope Pius XII in 1950, this feast is the oldest Marian feast and the crowning of her earthly journey.", ccc:"The CCC teaches that the Assumption is a singular participation in her Son's Resurrection and an anticipation of the resurrection of all Christians (CCC 966)." },
    { month:8,  day:28, emoji:"A", title:"Feast of Saint Augustine of Hippo", type:"Feast Day", year:"430", body:"One of the greatest theologians in Church history, Augustine lived a dissolute youth before his dramatic conversion at 32. His Confessions and City of God shaped Western Christianity. His famous line: 'Our heart is restless until it rests in Thee.'", ccc:"The CCC draws on Augustine extensively, especially regarding grace, original sin, and the nature of the Church (CCC 400)." },
    { month:9,  day:8,  emoji:"N", title:"Nativity of the Blessed Virgin Mary", type:"Feast Day", year:"", body:"The Church celebrates the birth of Mary, though Scripture does not record the event. Tradition names her parents as Joachim and Anne. Her birth is the dawn before the rising of the Sun of Justice — Christ.", ccc:"The CCC honors Mary as chosen before all ages to be the Mother of God, her birth prepared by God's grace (CCC 490)." },
    { month:9,  day:14, emoji:"E", title:"Exaltation of the Holy Cross", type:"Feast Day", year:"", body:"This feast commemorates the discovery of the True Cross by Saint Helena in Jerusalem around 326 AD, and the dedication of the Basilica of the Holy Sepulchre. The Cross, once an instrument of shame, becomes a throne of glory.", ccc:"The CCC teaches that the Cross is the unique sacrifice of Christ, the one mediator, which can never be repeated or supplemented (CCC 618)." },
    { month:9,  day:29, emoji:"M", title:"Feast of the Archangels", type:"Feast Day", year:"", body:"Michael, Gabriel, and Raphael are honored together. Michael leads the heavenly armies, Gabriel announces the Incarnation, and Raphael guides Tobias. The Church venerates these powerful spirits as ministers of God's providence.", ccc:"The CCC teaches that the existence of angels is a truth of faith, and that they surround Christ and serve in the history of salvation (CCC 331)." },
    { month:10, day:1,  emoji:"T", title:"Feast of Saint Therese of Lisieux", type:"Feast Day", year:"1897", body:"The Little Flower died at 24, yet Pope Pius XI called her the greatest saint of modern times. Her autobiography, Story of a Soul, revealed her little way of spiritual childhood — doing small things with great love.", ccc:"Her life embodies the CCC's teaching that holiness is for everyone through charity lived in ordinary circumstances (CCC 826)." },
    { month:10, day:4,  emoji:"F", title:"Feast of Saint Francis of Assisi", type:"Feast Day", year:"1226", body:"Born into wealth, Francis gave up everything to follow Christ radically — embracing poverty, founding the Franciscans, receiving the stigmata. His Canticle of the Creatures is one of the earliest poems in Italian literature.", ccc:"The CCC honors Francis as a model of care for creation, reflecting its teaching on the universal destination of goods (CCC 2402)." },
    { month:10, day:7,  emoji:"R", title:"Our Lady of the Rosary", type:"Feast Day", year:"", body:"Established to commemorate the Christian victory at Lepanto in 1571, attributed to the intercession of Our Lady through the Rosary. The feast honors Mary and the ancient prayer that meditates on the life of Christ through her eyes.", ccc:"The CCC honors the Rosary as an excellent prayer through which we contemplate the mysteries of Christ in union with Mary (CCC 971)." },
    { month:10, day:15, emoji:"T", title:"Feast of Saint Teresa of Avila", type:"Feast Day", year:"1582", body:"A 16th-century Spanish Carmelite and Doctor of the Church, Teresa reformed the Carmelite Order and wrote the Interior Castle, one of the greatest works on contemplative prayer in any language.", ccc:"The CCC draws on Teresa's mystical teaching, recognizing that prayer is the life of the new heart (CCC 2697)." },
    { month:10, day:22, emoji:"J", title:"Memorial of Saint John Paul II", type:"Feast Day", year:"2005", body:"Pope John Paul II is honored on this day, the anniversary of his papal inauguration in 1978. His pontificate of 27 years was marked by extraordinary travels, profound writings, and a witness to suffering united with Christ's Cross.", ccc:"His encyclicals, especially Veritatis Splendor and Fides et Ratio, are extensively cited in the CCC's treatment of moral theology." },
    { month:11, day:1,  emoji:"A", title:"Solemnity of All Saints", type:"Feast Day", year:"", body:"The Church celebrates all the saints, known and unknown, who now enjoy the vision of God in heaven. This feast reminds us that holiness is not the exception but the universal vocation — and that the Church triumphant is vast.", ccc:"The CCC teaches that all the faithful are called to holiness and the fullness of Christian life (CCC 2013)." },
    { month:11, day:2,  emoji:"S", title:"All Souls Day — Commemoration of the Faithful Departed", type:"Feast Day", year:"", body:"The Church prays for all the faithful departed, especially those in Purgatory. This day reflects the Catholic teaching that the bonds of love are not broken by death and that our prayers can aid those still being purified.", ccc:"The CCC teaches that Purgatory is a final purification of the elect before the beatific vision, and that our prayers assist them (CCC 1030)." },
    { month:11, day:22, emoji:"C", title:"Feast of Saint Cecilia", type:"Feast Day", year:"230", body:"A Roman martyr of the 3rd century, Cecilia is the patron saint of musicians. According to tradition, as the organs played at her wedding, she sang in her heart to God alone. Her name is invoked at the beginning of all sacred music.", ccc:"The CCC affirms that sacred music and song are important means of expressing and deepening faith in the liturgy (CCC 1156)." },
    { month:12, day:3,  emoji:"F", title:"Feast of Saint Francis Xavier", type:"Feast Day", year:"1552", body:"The great Jesuit missionary, Francis Xavier baptized over thirty thousand people in India, the Malay Archipelago, and Japan. He died on the island of Shanghuan, his eyes fixed on China, where he hoped to bring the faith next.", ccc:"The CCC teaches that mission is a requirement of the Church's catholicity — a command received from Christ Himself (CCC 849)." },
    { month:12, day:8,  emoji:"I", title:"Immaculate Conception of the Blessed Virgin Mary", type:"Feast Day", year:"", body:"Defined as dogma by Pope Pius IX in 1854, the Immaculate Conception teaches that Mary was preserved from original sin from the first moment of her conception, in anticipation of Christ's saving merits.", ccc:"The CCC teaches that Mary was redeemed in a more excellent fashion, preserved from all stain of original sin (CCC 492)." },
    { month:12, day:12, emoji:"G", title:"Our Lady of Guadalupe", type:"Marian Apparition", year:"1531", body:"In 1531, the Blessed Virgin Mary appeared to Saint Juan Diego at Tepeyac Hill near Mexico City, leaving her image miraculously imprinted on his tilma. She is patroness of the Americas and of the unborn.", ccc:"The CCC affirms that Marian apparitions can serve as signs that help the faithful live the Gospel more fully (CCC 67)." },
    { month:12, day:25, emoji:"N", title:"Nativity of Our Lord Jesus Christ", type:"Feast Day", year:"", body:"The Word was made flesh and dwelt among us. God enters human history as a helpless infant in a manger in Bethlehem. Christmas is the celebration of the Incarnation — the most extraordinary event in all of history.", ccc:"The CCC teaches that the Son of God became man so that we might know God's love, have a model of holiness, and become partakers of the divine nature (CCC 458)." },
    { month:12, day:26, emoji:"S", title:"Feast of Saint Stephen, First Martyr", type:"Martyrdom", year:"34", body:"The first martyr of the Christian faith, Stephen was stoned to death for his witness to the Risen Christ. As he died, he prayed for his executioners: Lord, do not hold this sin against them. The young man Saul watched and approved.", ccc:"The CCC honors the martyrs as the supreme witnesses to the truth of the faith (CCC 2473)." },
    { month:12, day:27, emoji:"J", title:"Feast of Saint John the Apostle", type:"Feast Day", year:"100", body:"The Beloved Disciple who stood at the Cross, received the Blessed Mother into his care, and outlived all the other apostles. Author of the fourth Gospel, three letters, and the Book of Revelation. His message: God is love.", ccc:"The CCC affirms that Sacred Scripture, including John's Gospel, is the Word of God expressed in human language (CCC 101)." },
  ];

  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // Find today's feast, or pick one based on day of year
  let happening = HAPPENINGS.find(h => h.month === month && h.day === day);
  if (!happening) {
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    happening = HAPPENINGS[dayOfYear % HAPPENINGS.length];
  }

  if (!happening) return null;

  return (
    <div style={{ background: "linear-gradient(135deg,#FFFBF0,#FFF3D6)", border: `1px solid ${GOLD}50`, borderRadius: 18, padding: 20, marginBottom: 14, position: "relative", overflow: "hidden", boxShadow: CARD_SHADOW_STRONG }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(180,140,60,0.05)" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: `${GOLD}15`, border: `1px solid ${GOLD}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <CalendarIco />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: GOLD, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: CINZEL, marginBottom: 4, fontWeight: 700 }}>
            Today in the Church {happening.year ? `· ${happening.year}` : ""}
          </div>
          <div style={{ fontFamily: CINZEL, fontSize: 16, color: WHITE, fontWeight: 600, letterSpacing: "0.05em", lineHeight: 1.4, textShadow: EMBOSS }}>{happening.title}</div>
        </div>
      </div>
      {happening.type && (
        <div style={{ display: "inline-block", background: `${GOLD}15`, border: `1px solid ${GOLD}40`, borderRadius: 20, padding: "4px 14px", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.1em", fontWeight: 600 }}>{happening.type}</span>
        </div>
      )}
      <p style={{ fontSize: 14, color: CREAM, lineHeight: 1.88, fontFamily: "'Lato',sans-serif", marginBottom: 12, fontWeight: 500 }}>{happening.body}</p>
      {happening.ccc && (
        <div style={{ background: SURFACE, borderLeft: `3px solid ${GOLD}80`, borderRadius: "0 10px 10px 0", padding: "11px 14px" }}>
          <div style={{ fontSize: 11, color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: CINZEL, marginBottom: 5, fontWeight: 700 }}>Catechism Connection</div>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.78, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>{happening.ccc}</p>
        </div>
      )}
    </div>
  );
}

// ─── SVG ICONS ───────────────────────────────────────────────────────────────
const CalendarIco = () => <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="2" stroke={GOLD} strokeWidth="1.5" fill="none"/><line x1="2" y1="7" x2="16" y2="7" stroke={GOLD} strokeWidth="1.5"/><line x1="6" y1="1" x2="6" y2="5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="1" x2="12" y2="5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const VerseIco = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 2h8l4 4v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke={GOLD} strokeWidth="1.5" fill="none"/><line x1="5" y1="8" x2="13" y2="8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="11" x2="11" y2="11" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/></svg>;
const StarIco = () => <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.3 4L7 9.5 3.2 11.5l1.3-4L1 5h4.5L7 1z" fill="rgba(255,255,255,0.85)"/></svg>;
const UserIco = () => <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="5" r="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3" fill="none"/><path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.3" strokeLinecap="round" fill="none"/></svg>;

// ─── FIXED HEADER BAR ────────────────────────────────────────────────────────
function AppHeader({ tab, user, onSignOut }) {
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const firstName = user?.name?.split(' ')[0] || '';
  return (
    <>
      <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: HEADER_BG, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 16, paddingRight: 16, paddingTop: 'env(safe-area-inset-top)', minHeight: HEADER_H, boxShadow: '0 2px 20px rgba(0,0,0,0.30)' }}>
        <div style={{ width: 105 }}>
          {tab === 'home' && (
            <button onClick={() => setShowPremiumModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '6px 11px', cursor: 'pointer' }}>
              <StarIco />
              <span style={{ fontSize: 12, color: '#F5E6C8', fontFamily: CINZEL, letterSpacing: '0.07em', fontWeight: 600 }}>Premium</span>
            </button>
          )}
        </div>
        <div style={{ fontFamily: CINZEL, fontSize: 17, color: '#F5E6C8', fontWeight: 600, letterSpacing: '0.2em', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>VERBUM</div>
        <div style={{ width: 105, display: 'flex', justifyContent: 'flex-end' }}>
          {tab === 'home' ? (
            <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '6px 11px', cursor: 'pointer' }}>
              <UserIco />
              <span style={{ fontSize: 12, color: '#F5E6C8', fontFamily: CINZEL, letterSpacing: '0.06em', fontWeight: 600 }}>{firstName}</span>
            </button>
          ) : (
            <button onClick={onSignOut} style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 20, padding: '6px 12px', cursor: 'pointer' }}>
              <span style={{ fontSize: 12, color: '#F5E6C8', fontFamily: CINZEL, letterSpacing: '0.06em', fontWeight: 600 }}>Sign out</span>
            </button>
          )}
        </div>
      </div>
      {showPremiumModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 24, padding: 32, maxWidth: 340, width: '100%', boxShadow: CARD_SHADOW_STRONG, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 2, background: `linear-gradient(90deg,transparent,${GOLD},transparent)` }} />
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${GOLD}18`, border: `1.5px solid ${GOLD}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><StarIco /></div>
              <div style={{ fontFamily: CINZEL, fontSize: 20, color: WHITE, fontWeight: 700, letterSpacing: '0.08em', textShadow: EMBOSS, marginBottom: 6 }}>Verbum Premium</div>
              <div style={{ fontSize: 13, color: GOLD, fontFamily: CINZEL, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 16, fontWeight: 600 }}>Coming Soon</div>
              <p style={{ fontSize: 15, color: CREAM, lineHeight: 1.85, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>Verbum Premium is currently in development. We will keep you updated once it is ready to launch. Thank you for your patience and support.</p>
            </div>
            <button onClick={() => setShowPremiumModal(false)} style={{ width: '100%', background: HEADER_BG, border: 'none', borderRadius: 14, padding: '14px', color: '#F5E6C8', fontSize: 15, fontFamily: CINZEL, fontWeight: 600, letterSpacing: '0.08em', cursor: 'pointer' }}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── STATIC DAILY VERSE CARD ─────────────────────────────────────────────────
const DAILY_VERSES = [
  { ref:"Psalm 23:1", text:"The Lord is my shepherd; I shall not want.", category:["peace","trust"], explanation:"King David meditates on God as a shepherd who tends to every need, knowing each sheep by name and leading them to green pastures. For us today, it is a reminder that God is not a distant ruler but a loving guide.", example:"When anxiety rises today, pray this verse slowly and let it anchor you." },
  { ref:"John 3:16", text:"For God so loved the world that he gave his only Son, so that everyone who believes in him might not perish but might have eternal life.", category:["love","hope"], explanation:"Called the Gospel in miniature, this verse captures the entire mystery of salvation. God's love is not passive — it moves Him to give His most precious gift for our sake.", example:"When you doubt whether you are loved, return to this verse. You were worth the Cross." },
  { ref:"Philippians 4:13", text:"I have the strength for everything through him who empowers me.", category:["strength","courage"], explanation:"Paul wrote this from prison, yet radiating joy. The strength he speaks of is not willpower but a supernatural grace that flows from union with Christ.", example:"Whatever you are facing today, claim this promise. Not your strength — His." },
  { ref:"Jeremiah 29:11", text:"For I know the plans I have for you, says the Lord, plans for your welfare and not for evil, to give you a future and a hope.", category:["hope","trust"], explanation:"Spoken to Israel in exile, this promise shines brightest in darkness. God's plan is always oriented toward our true flourishing, even when we cannot see it.", example:"In uncertainty, write this verse somewhere visible as a daily anchor." },
  { ref:"Matthew 11:28", text:"Come to me, all you who labor and are burdened, and I will give you rest.", category:["comfort","rest"], explanation:"Jesus offers radical rest — not laziness, but the deep refreshment that comes from abiding with Him. Catholic spirituality finds this rest especially in prayer and the Eucharist.", example:"Spend five quiet minutes today simply resting in God's presence." },
  { ref:"Romans 8:28", text:"We know that all things work for good for those who love God, who are called according to his purpose.", category:["trust","hope"], explanation:"Paul does not say all things are good — he says God works all things for good. Even suffering is not wasted in His economy.", example:"Name one difficult thing in your life and offer it to God with trust." },
  { ref:"Isaiah 40:31", text:"Those who hope in the Lord will renew their strength. They will soar on wings like eagles.", category:["strength","renewal"], explanation:"Eagles soar by letting thermal winds lift them. Hoping in God is just like that — an act of surrender that allows His wind to carry us.", example:"Instead of striving harder today, try surrendering more deeply." },
  { ref:"Psalm 46:10", text:"Be still and know that I am God!", category:["peace","prayer"], explanation:"Eight words that capture the entire spirituality of contemplative prayer. The Hebrew word for still means to let go, to release, to slacken.", example:"Set a timer for three minutes. Sit in silence with just this verse." },
  { ref:"Proverbs 3:5-6", text:"Trust in the Lord with all your heart, on your own intelligence do not rely. In all your ways be mindful of him, and he will make straight your paths.", category:["trust","wisdom"], explanation:"The Hebrew word for trust implies leaning on something — the way you lean against a wall. True wisdom begins with humble openness to God.", example:"Before making a decision today, pause and ask God to illumine your thinking." },
  { ref:"John 14:27", text:"Peace I leave with you; my peace I give to you. Not as the world gives do I give it to you.", category:["peace","comfort"], explanation:"Spoken at the Last Supper, hours before His arrest. Even in that shadow, Jesus offered His own divine peace — not the world's fragile peace of favorable circumstances.", example:"When worry grips you, pray these words slowly and let Christ's peace settle in." },
  { ref:"Lamentations 3:22-23", text:"The Lord's acts of mercy are not exhausted, his compassion is not spent; they are renewed each morning — great is your faithfulness!", category:["mercy","hope"], explanation:"Written in the ruins of Jerusalem, yet discovering something unshakeable: God's mercies are new every morning. Yesterday's failures do not exhaust today's grace.", example:"Begin today by receiving God's mercy fresh, whatever yesterday looked like." },
  { ref:"Luke 1:37", text:"For nothing will be impossible for God.", category:["faith","hope"], explanation:"Gabriel's words to Mary at the Annunciation — the great declaration of divine omnipotence, spoken to reassure a young woman asked to do the humanly impossible.", example:"Name the one thing that seems impossible in your life and pray this verse over it." },
  { ref:"Psalm 34:18", text:"The Lord is close to the brokenhearted, saves those whose spirit is crushed.", category:["grief","comfort"], explanation:"God does not observe our suffering from a distance — He draws near to it. Brokenhearted in Hebrew describes a heart shattered like a clay pot, and it is precisely there God is closest.", example:"If your heart is heavy today, know that this is exactly where God chooses to dwell." },
  { ref:"Romans 8:38-39", text:"Nothing will be able to separate us from the love of God in Christ Jesus our Lord.", category:["love","faith"], explanation:"Paul lists every conceivable power and declares that none of them can sever the bond of God's love for us.", example:"Recite this verse as a declaration today, especially over your greatest fear." },
  { ref:"Isaiah 41:10", text:"Do not fear, for I am with you; do not be afraid, for I am your God. I will strengthen you, I will help you.", category:["courage","trust"], explanation:"God speaks directly into fear. The command not to fear is an invitation to anchor in a deeper reality — His presence and power.", example:"Write down what you are afraid of, then read this verse over it as a prayer." },
  { ref:"Psalm 121:1-2", text:"I lift up my eyes to the mountains — where does my help come from? My help comes from the Lord, the maker of heaven and earth.", category:["trust","strength"], explanation:"A pilgrim's prayer lifting eyes above the immediate terrain to the God who transcends all created things and yet is personally close.", example:"When overwhelmed today, literally look upward and pray this verse." },
  { ref:"Matthew 6:33", text:"Seek first the kingdom of God and his righteousness, and all these things will be given you besides.", category:["trust","wisdom"], explanation:"Jesus reorders our priorities entirely. Anxiety about provision is addressed not by earning more but by seeking God first.", example:"Before checking your phone this morning, spend five minutes with God." },
  { ref:"1 Corinthians 13:4-5", text:"Love is patient, love is kind. It is not jealous, it is not pompous, it is not inflated, it is not rude.", category:["love","virtue"], explanation:"Written to a quarreling church, not as poetry but as a challenge. Every quality described is not a feeling but a concrete daily choice.", example:"Replace the word love with your own name and see where it challenges you today." },
  { ref:"Hebrews 11:1", text:"Faith is the realization of what is hoped for and evidence of things not seen.", category:["faith","hope"], explanation:"The great definition of faith — not blind optimism but a real participation in realities that transcend our physical senses, grounded in God's proven faithfulness.", example:"Name one thing you are hoping for that you cannot yet see and place it in God's hands." },
  { ref:"1 Peter 5:7", text:"Cast all your worries upon him because he cares for you.", category:["trust","peace"], explanation:"Peter invites us to throw our anxieties onto God — not politely hand them over, but cast them with force. The reason is simply: He cares for you personally.", example:"Name your worries one by one today and deliberately cast each one to God in prayer." },
  { ref:"Psalm 27:1", text:"The Lord is my light and my salvation; whom do I fear? The Lord is my life's refuge; of whom am I afraid?", category:["courage","faith"], explanation:"David faces real enemies and real danger yet speaks with remarkable calm. His security comes not from circumstances but from confidence in God.", example:"Face your greatest fear today and let this verse be your response to it." },
  { ref:"John 15:5", text:"I am the vine, you are the branches. Whoever remains in me and I in him will bear much fruit, because without me you can do nothing.", category:["faith","wisdom"], explanation:"Jesus uses the most organic of images to describe our relationship with Him. Fruitfulness is not effort but connection.", example:"Ask yourself: am I staying connected to the vine, or am I trying to bear fruit on my own?" },
  { ref:"Micah 6:8", text:"You have been told, O mortal, what is good, and what the Lord requires of you: only to do justice and to love goodness, and to walk humbly with your God.", category:["wisdom","virtue"], explanation:"The prophet distills the entire Law to three things. Justice, mercy, and humility are not additions to faith — they are its natural expression.", example:"Choose one of these three to focus on deliberately today." },
  { ref:"Zephaniah 3:17", text:"The Lord your God is in your midst, a mighty savior. He will rejoice over you with gladness and renew you in his love.", category:["love","peace"], explanation:"One of Scripture's most tender images — God rejoicing over us. Not tolerating us, not merely forgiving us, but delighting in us with gladness.", example:"Sit quietly and let yourself receive this: God rejoices over you right now, today." },
  { ref:"Sirach 2:6", text:"Trust in God, and he will help you; make straight your ways and hope in him.", category:["trust","hope"], explanation:"From the Wisdom tradition of the Catholic Bible, this verse offers a simple and direct path through difficulty: trust, straighten your path, and hope.", example:"Is there an area of your life where your path needs straightening? Bring it to God today." },
  { ref:"Wisdom 3:1", text:"The souls of the righteous are in the hand of God, and no torment shall touch them.", category:["comfort","faith"], explanation:"A profound source of consolation for those grieving the loss of loved ones. Death does not have the final word — the righteous are held safely in God's own hand.", example:"If you have lost someone you love, pray this verse for them today." },
  { ref:"Psalm 139:14", text:"I praise you, because I am wonderfully made; wonderful are your works! My very self you know.", category:["love","faith"], explanation:"David meditates on God's intimate knowledge of him. You are not an accident but a deliberate and wonderful work of God.", example:"Say this verse about yourself today, even if it feels difficult to believe." },
  { ref:"Isaiah 43:1", text:"Do not fear, for I have redeemed you; I have called you by name: you are mine.", category:["love","comfort"], explanation:"God addresses each person not as a number or a category but by name. You are personally known, personally called, and personally claimed by God.", example:"Hear God speak your own name as you read this verse. You belong to Him." },
  { ref:"Colossians 3:23", text:"Whatever you do, do from the heart, as for the Lord and not for others.", category:["wisdom","strength"], explanation:"Paul elevates every form of work to an act of worship. The dishwasher, the caregiver, the clerk: all can work as for the Lord.", example:"Offer your work today — all of it — as a prayer to God." },
  { ref:"Galatians 5:22-23", text:"The fruit of the Spirit is love, joy, peace, patience, kindness, generosity, faithfulness, gentleness, self-control.", category:["virtue","renewal"], explanation:"Paul lists not achievements but fruit — something that grows naturally from a living connection with the Spirit. These qualities are not manufactured but cultivated.", example:"Which fruit of the Spirit do you most need to grow right now? Ask the Spirit for it." },
  { ref:"Ephesians 2:10", text:"We are God's handiwork, created in Christ Jesus for the good works that God has prepared in advance.", category:["purpose","faith"], explanation:"The Greek word for handiwork is poiema — poem. You are God's poem, composed with care and intention, created for works He already has in mind for you.", example:"Ask God today what good work He has prepared for you and take one step toward it." },
  { ref:"Psalm 103:8", text:"Merciful and gracious is the Lord, slow to anger, abounding in kindness.", category:["mercy","love"], explanation:"This description of God's character appears repeatedly in Scripture. God is not reluctant to show mercy; He abounds in it.", example:"Receive this truth personally today: God abounds in kindness toward you." },
  { ref:"2 Corinthians 12:9", text:"My grace is sufficient for you, for power is made perfect in weakness.", category:["strength","trust"], explanation:"God's response to Paul's suffering is not removal of the thorn but the gift of grace within it. Divine power reaches its fullest expression through human weakness.", example:"Name your greatest weakness today and offer it to God as the place where His power can work." },
  { ref:"Psalm 16:8", text:"I keep the Lord always before me; with the Lord at my right hand, I shall never be shaken.", category:["peace","faith"], explanation:"David's secret of stability is not the absence of threats but the constancy of God's presence.", example:"Set a reminder today to pause three times and simply acknowledge God's presence with you." },
  { ref:"Romans 15:13", text:"May the God of hope fill you with all joy and peace in believing, so that you may abound in hope by the power of the Holy Spirit.", category:["hope","peace"], explanation:"Paul prays for an overflowing of hope — not a cautious optimism but an abundance, powered not by willpower but by the Holy Spirit.", example:"Pray this verse over yourself and over someone you know who needs hope today." },
  { ref:"2 Maccabees 12:46", text:"It is a holy and wholesome thought to pray for the dead, that they may be loosed from sins.", category:["faith","mercy"], explanation:"This deuterocanonical text is the scriptural foundation for the Church's teaching on prayer for the dead — a uniquely Catholic and deeply consoling doctrine.", example:"Pray for someone who has died today — a family member, a friend, or a forgotten soul." },
  { ref:"Matthew 18:20", text:"For where two or three are gathered together in my name, there am I in the midst of them.", category:["faith","community"], explanation:"Jesus promises His presence not only in solitary prayer but in the gathered community. The Church is a place where Christ is personally present.", example:"Pray with at least one other person today, even briefly, claiming this promise." },
  { ref:"Psalm 118:24", text:"This is the day the Lord has made; let us rejoice in it and be glad.", category:["joy","gratitude"], explanation:"Originally a liturgical shout at the Temple, now prayed by the whole Church. Every day — even a difficult one — is a gift made by God and worthy of gratitude.", example:"Say this verse aloud when you wake up tomorrow and mean it, whatever the day holds." },
  { ref:"Tobit 4:15", text:"Do to no one what you yourself dislike. Give to the hungry some of your bread, and to the naked some of your clothing.", category:["virtue","love"], explanation:"From the deuterocanonical book of Tobit, a father's wisdom to his son. The golden rule and concrete charity — two pillars of a life well-lived.", example:"Do one concrete act of generosity today for someone who cannot repay you." },
  { ref:"Isaiah 55:8-9", text:"For my thoughts are not your thoughts, nor are your ways my ways, says the Lord. For as the heavens are higher than the earth, so are my ways higher than your ways.", category:["trust","wisdom"], explanation:"A radical invitation to humility before the mystery of God. What seems like failure or loss may be part of a design too large for us to see from where we stand.", example:"Release something today that you have been trying to control and trust God's higher way." },
  { ref:"Revelation 21:4", text:"He will wipe every tear from their eyes, and there shall be no more death or mourning, wailing or pain, for the old order has passed away.", category:["hope","comfort"], explanation:"The final vision of Scripture — God personally wiping every tear. This is not escapism but the ultimate destination of all Christian hope.", example:"Let this vision of the end comfort you in whatever you are suffering today. This is where we are headed." },
  { ref:"Psalm 91:1-2", text:"You who dwell in the shelter of the Most High, who abide in the shade of the Almighty, say to the Lord: my refuge and fortress, my God in whom I trust.", category:["trust","peace"], explanation:"An image of profound safety — dwelling not just near God but within Him, sheltered by His very presence.", example:"Begin your day by consciously placing yourself within God's shelter through prayer." },
  { ref:"John 8:12", text:"I am the light of the world. Whoever follows me will not walk in darkness, but will have the light of life.", category:["faith","hope"], explanation:"One of the great I AM statements of Jesus. He does not merely show a path — He is the light that makes the path visible.", example:"In whatever feels dark in your life today, ask Jesus to be your light in it." },
  { ref:"Acts 1:8", text:"You will receive power when the Holy Spirit comes upon you, and you will be my witnesses.", category:["faith","courage"], explanation:"The last words of Jesus before the Ascension. The disciples are sent not in their own strength but promised the power of the Holy Spirit.", example:"Ask the Holy Spirit today to empower you as a witness in your ordinary life." },
  { ref:"1 John 4:18", text:"There is no fear in love, but perfect love drives out fear.", category:["love","peace"], explanation:"The logic of love and fear are mutually exclusive. As we grow in the experience of God's love, fear loses its grip.", example:"Identify one fear you carry and ask God to replace it with a deeper awareness of His love." },
  { ref:"Deuteronomy 31:6", text:"Be strong and steadfast; do not fear or be dismayed, for the Lord, your God, who goes before you, will be with you.", category:["courage","trust"], explanation:"Moses speaks to a people entering unknown territory. The basis for courage is not the absence of danger but the presence of God who goes before them.", example:"Whatever you are entering into today, remember: God goes before you." },
  { ref:"James 1:17", text:"Every good gift and every perfect gift is from above, coming down from the Father of lights.", category:["gratitude","love"], explanation:"James roots all goodness in God's generous nature. The gifts of life, beauty, love, friendship, talent — all are expressions of the Father's lavish generosity.", example:"Name three good things in your life today and trace them back to God as their source." },
  { ref:"Psalm 62:1-2", text:"My soul rests in God alone, from whom comes my salvation. God alone is my rock and salvation, my fortress; I shall never fall.", category:["trust","peace"], explanation:"The Hebrew for rests means a silence of complete surrender. Not passive resignation but active trust that has found its resting place in God alone.", example:"Practice resting in God today — not solving, not striving, just trusting." },
  { ref:"Sirach 3:17", text:"My child, conduct your affairs with humility, and you will be loved more than a giver of gifts.", category:["wisdom","virtue"], explanation:"Ben Sira's wisdom cuts against the grain of a world that prizes power and display. Genuine humility draws love that no gift can purchase.", example:"Practice one act of genuine humility today, unseen and unannounced." },
  { ref:"Matthew 5:9", text:"Blessed are the peacemakers, for they will be called children of God.", category:["peace","virtue"], explanation:"Peacemakers in the ancient world actively worked to reconcile divided parties, often at personal cost. This is the family resemblance of God's children.", example:"Is there a relationship in your life that needs a peacemaker today? Could that be you?" },
];

function getDailyVerseStatic() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

function DailyVerseCard({ onFav, favorites }) {
  const verse = getDailyVerseStatic();
  const [expanded, setExpanded] = useState(false);
  const [showFavPanel, setShowFavPanel] = useState(false);
  const isFav = favorites.has(verse.ref);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ background: 'linear-gradient(135deg,#FDF6E3,#F5E9C8)', border: `1px solid ${GOLD}60`, borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden', boxShadow: CARD_SHADOW_STRONG }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(180,140,60,0.08)' }} />
        <div style={{ fontSize: 14, color: GOLD_BRIGHT, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 14, fontFamily: CINZEL }}>Daily Verse</div>
        <div style={{ fontFamily: CINZEL, fontSize: 18, color: WHITE, lineHeight: 2.0, marginBottom: 14, letterSpacing: '0.04em', fontWeight: 600, textShadow: EMBOSS }}>"{verse.text}"</div>
        <div style={{ fontFamily: CINZEL, fontSize: 14, color: GOLD_BRIGHT, fontWeight: 700, letterSpacing: '0.16em', marginBottom: 18 }}>— {verse.ref}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setExpanded(!expanded); setShowFavPanel(false); }} style={{ flex: 1, background: 'rgba(154,107,31,0.12)', border: `1px solid ${GOLD}50`, borderRadius: 12, padding: '10px 0', color: GOLD_BRIGHT, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'Lato',sans-serif", fontWeight: 700 }}>
            <VerseIco /> {expanded ? 'Hide Reflection' : 'Read Reflection'}
          </button>
          <button onClick={() => { setShowFavPanel(!showFavPanel); setExpanded(false); }} style={{ background: isFav ? `${GOLD}25` : 'rgba(154,107,31,0.12)', border: `1px solid ${isFav ? GOLD : GOLD + '50'}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HeartIco filled={isFav} />
          </button>
        </div>
      </div>
      {expanded && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 22, marginTop: 8, boxShadow: CARD_SHADOW }}>
          <p style={{ fontSize: 15, color: CREAM, lineHeight: 1.95, marginBottom: 16, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>{verse.explanation}</p>
          {verse.example && (
            <div style={{ background: SURFACE, borderLeft: `3px solid ${GOLD}`, borderRadius: '0 10px 10px 0', padding: '13px 16px' }}>
              <div style={{ fontSize: 13, color: GOLD_BRIGHT, fontWeight: 800, letterSpacing: '0.14em', marginBottom: 7, textTransform: 'uppercase', fontFamily: CINZEL }}>In Practice</div>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.85, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>{verse.example}</p>
            </div>
          )}
          {verse.category && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>{verse.category.map(c => <Pill key={c} label={c} />)}</div>}
        </div>
      )}
      {showFavPanel && (
        <div style={{ background: '#FDF8F0', border: `1px solid ${GOLD}60`, borderRadius: 14, padding: 18, marginTop: 8, boxShadow: CARD_SHADOW }}>
          <p style={{ fontSize: 14, color: MUTED, marginBottom: 12, fontFamily: "'Lato',sans-serif", lineHeight: 1.75, fontWeight: 500 }}>{isFav ? 'This verse is in your Favorites.' : 'Save this verse to your Favorites.'}</p>
          <button onClick={() => { onFav(verse.ref); setShowFavPanel(false); }} style={{ width: '100%', background: isFav ? '#FFF0F0' : '#F0FFF4', border: `1px solid ${isFav ? '#E08080' : '#80C080'}`, borderRadius: 10, padding: '12px', color: isFav ? '#C06060' : GOLD, fontSize: 14, cursor: 'pointer', fontFamily: CINZEL, letterSpacing: '0.07em', fontWeight: 700 }}>
            {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── SAINT OF THE DAY CARD ────────────────────────────────────────────────────
function SaintOfDayCard({ saint }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoLoaded, setPhotoLoaded] = useState(false);

  useEffect(() => {
    if (!saint.wikiTitle) return;
    const cacheKey = `verbum-saint-photo-${saint.wikiTitle}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setPhotoUrl(cached); return; }

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(saint.wikiTitle)}`)
      .then(r => r.json())
      .then(data => {
        const url = data.thumbnail?.source || null;
        if (url) {
          sessionStorage.setItem(cacheKey, url);
          setPhotoUrl(url);
        }
      })
      .catch(() => {});
  }, [saint.wikiTitle]);

  const feastDate = new Date(2024, saint.feast.m - 1, saint.feast.d)
    .toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div style={{ background: CARD, border: `1.5px solid ${BORDER}`, borderRadius: 18, padding: 20, marginBottom: 14, boxShadow: CARD_SHADOW_STRONG, overflow: "hidden" }}>
      {/* Header row with photo */}
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
        {/* Photo */}
        <div style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,${GOLD}20,${GOLD}08)`, border: `1.5px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={saint.name}
              onLoad={() => setPhotoLoaded(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: photoLoaded ? 1 : 0, transition: "opacity 0.3s" }}
            />
          ) : (
            <Cross size={28} />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: GOLD_BRIGHT, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4, fontFamily: CINZEL }}>Saint of the Day</div>
          <div style={{ fontFamily: CINZEL, fontSize: 17, color: WHITE, fontWeight: 700, letterSpacing: "0.04em", textShadow: EMBOSS, marginBottom: 4, lineHeight: 1.3 }}>{saint.name}</div>
          <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>Feast Day: {feastDate}</div>
        </div>
      </div>

      {/* Patron */}
      {saint.patron && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: GOLD_BRIGHT, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 6, fontFamily: CINZEL }}>Patron of</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {saint.patron.map(p => <Pill key={p} label={p} />)}
          </div>
        </div>
      )}

      {/* Themes */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {saint.themes.map(t => <Pill key={t} label={t} />)}
      </div>

      {/* Bio */}
      <p style={{ fontSize: 14, color: CREAM, lineHeight: 1.85, marginBottom: 14, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>{saint.bio}</p>

      {/* Quote */}
      <div style={{ borderLeft: `3px solid ${GOLD}`, padding: "11px 14px", background: SURFACE, borderRadius: "0 10px 10px 0" }}>
        <div style={{ fontFamily: CINZEL, fontSize: 15, color: WHITE, lineHeight: 1.85, fontWeight: 500, textShadow: EMBOSS }}>"{saint.quote}"</div>
      </div>
    </div>
  );
}


function HomeTab({favorites,onFav,user}) {
  // Note: top padding accounts for fixed header
  const [verse,setVerse]=useState(getDailyVerse());
  const [expanded,setExpanded]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const [showFavPanel,setShowFavPanel]=useState(false);
  const [usedIds,setUsedIds]=useState(new Set([getDailyVerse().id]));
  const [time,setTime]=useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setTime(new Date()),1000); return()=>clearInterval(t); },[]);
  const saint=getSaintOfDay(); const season=getLiturgicalSeason();
  const h=time.getHours(); const is3oclock=isThreeOClockHour();
  const moment=h<12?{g:`Good Morning${user?`, ${user.name.split(' ')[0]}`:''}`,p:"Morning Prayer",l:"Begin this day in God's presence."}:h<17?{g:"Good Afternoon",p:"Midday Prayer",l:"Pause and rest in the Lord."}:{g:"Good Evening",p:"Evening Prayer",l:"Give thanks for this day."};
  const dateStr=time.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const timeStr=time.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true});
  const isFav=favorites.has(verse.id);
  const refresh=()=>{ setRefreshing(true); setTimeout(()=>{ const pool=VERSES.filter(v=>!usedIds.has(v.id)||usedIds.size>=VERSES.length); const next=(pool.length?pool:VERSES)[Math.floor(Math.random()*(pool.length||VERSES.length))]; setVerse(next);setExpanded(false);setShowFavPanel(false); setUsedIds(p=>{const s=new Set(p.size>=VERSES.length?[]:p);s.add(next.id);return s;}); setRefreshing(false); },400); };
  const S={ sectionLabel:{fontSize:14,color:GOLD_BRIGHT,fontWeight:800,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:14,fontFamily:CINZEL}, card:{background:CARD,border:`1px solid ${BORDER}`,borderRadius:18,padding:20,marginBottom:14,boxShadow:CARD_SHADOW} };
  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{textAlign:"center",padding:"24px 0 20px",marginTop:"calc(56px + env(safe-area-inset-top))"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Cross size={28}/></div>
        <div style={{fontSize:16,color:GOLD_BRIGHT,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:4,fontWeight:700,fontFamily:CINZEL}}>{dateStr}</div>
        <div style={{fontSize:16,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500,marginBottom:8,letterSpacing:"0.06em"}}>{timeStr}</div>
        <div style={{fontFamily:CINZEL,fontSize:28,color:WHITE,marginBottom:6,letterSpacing:"0.08em",fontWeight:700,textShadow:EMBOSS}}>{moment.g}</div>
        <div style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>{moment.l}</div>
      </div>
      <DailyVerseCard onFav={onFav} favorites={favorites} />

      {is3oclock && <ThreeOClockBanner />}
      <DailyCatholicHappening />
      <SaintOfDayCard saint={saint} />
      <div style={{background:season.bg,border:`1.5px solid ${season.border}`,borderRadius:14,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 1px 6px rgba(0,0,0,0.06)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:season.light,flexShrink:0}}/>
          <div>
            <div style={{fontSize:12,color:season.light,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:CINZEL,fontWeight:700,marginBottom:2}}>Liturgical Season</div>
            <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS}}>{season.name}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:130}}>{season.cats.map(c=><span key={c} style={{fontSize:11,background:"rgba(255,255,255,0.5)",color:season.light,padding:"3px 9px",borderRadius:20,fontFamily:"'Lato',sans-serif",border:`1px solid ${season.border}`,fontWeight:600}}>{c}</span>)}</div>
      </div>
      <div style={{padding:"10px 14px",borderTop:`1px solid ${BORDER}`,background:CARD,display:"flex",gap:10,alignItems:"flex-end"}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="How are you feeling today?" rows={1} style={{flex:1,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:18,padding:"10px 16px",color:WHITE,fontSize:16,resize:"none",outline:"none",fontFamily:"'Lato',sans-serif",lineHeight:1.5,maxHeight:100}}/>
        <button onClick={send} disabled={!input.trim()||loading} style={{width:40,height:40,borderRadius:"50%",background:input.trim()&&!loading?GOLD:SURFACE,border:`1px solid ${input.trim()&&!loading?GOLD:BORDER}`,cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0}}><SendIco/></button>
      </div>
      <style>{`@keyframes pulse{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

//  BIBLE SEARCH (EXPLORE) 
function BibleSearchView() {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 20, padding: 32, textAlign: "center", boxShadow: CARD_SHADOW_STRONG }}>
      <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${GOLD}15`, border: `1.5px solid ${GOLD}50`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
        <BookIco on={true} />
      </div>
      <div style={{ fontFamily: CINZEL, fontSize: 20, color: WHITE, fontWeight: 700, letterSpacing: "0.08em", textShadow: EMBOSS, marginBottom: 8 }}>Bible Search</div>
      <div style={{ fontSize: 13, color: GOLD, fontFamily: CINZEL, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18, fontWeight: 600 }}>Coming in Premium</div>
      <p style={{ fontSize: 15, color: CREAM, lineHeight: 1.85, fontFamily: "'Lato',sans-serif", fontWeight: 500, marginBottom: 20 }}>
        Full Bible Search across all 73 books of the Catholic Bible — with verse text, Catholic reflection, and Catechism connection — is being prepared for Verbum Premium.
      </p>
      <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.78, fontFamily: "'Lato',sans-serif", fontWeight: 500 }}>
        In the meantime, browse the verse library below or explore the Prayers tab for Scripture embedded in our prayer guides.
      </p>
    </div>
  );
}

//  EXPLORE TAB 
function ExploreTab({favorites,onFav}) {
  const [view,setView]=useState("browse"); const [selectedCat,setSelectedCat]=useState(null); const [expandedId,setExpandedId]=useState(null);
  const filtered=selectedCat?VERSES.filter(v=>v.category.includes(selectedCat)):VERSES;
  // Combine VERSES favorites (by ID) and DAILY_VERSES favorites (by ref)
  const favVerses=VERSES.filter(v=>favorites.has(v.id));
  const favDailyVerses=DAILY_VERSES.filter(v=>favorites.has(v.ref)).map(v=>({...v,id:v.ref,category:v.category||[]}));
  const allFavVerses=[...favVerses,...favDailyVerses];
  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{padding:"24px 0 16px",marginTop:"calc(56px + env(safe-area-inset-top))"}}><div style={{fontFamily:CINZEL,fontSize:22,color:WHITE,marginBottom:4,letterSpacing:"0.07em",fontWeight:600,textShadow:EMBOSS}}>{view==="browse"?"Verse Library":view==="search"?"Bible Search":"My Favorites"}</div><div style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>{view==="browse"?"Browse by theme or feeling":view==="search"?"All 73 books of the Catholic Bible":"Your personal collection"}</div></div>
      <div style={{display:"flex",background:SURFACE,borderRadius:12,padding:3,marginBottom:18,border:`1px solid ${BORDER}`,gap:2}}>
        {[{id:"browse",label:" Browse"},{id:"search",label:" Bible"},{id:"favorites",label:` Saved${favVerses.length?" ("+favVerses.length+")":""}`}].map(t=><button key={t.id} onClick={()=>{setView(t.id);setExpandedId(null);}} style={{flex:1,background:view===t.id?CARD:"none",border:view===t.id?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:10,padding:"8px 0",color:view===t.id?GOLD_BRIGHT:MUTED,fontSize:14,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all 0.2s"}}>{t.label}</button>)}
      </div>
      {view==="browse"&&(<><div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}><button onClick={()=>setSelectedCat(null)} style={{background:!selectedCat?GOLD:CARD,border:`1px solid ${!selectedCat?GOLD:BORDER}`,borderRadius:20,padding:"5px 14px",color:!selectedCat?"#1A1000":MUTED,fontSize:13,cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:!selectedCat?700:400}}>All</button>{CATEGORIES.map(c=>{const on=selectedCat===c.id;return<button key={c.id} onClick={()=>setSelectedCat(on?null:c.id)} style={{background:on?GOLD:CARD,border:`1px solid ${on?GOLD:BORDER}`,borderRadius:20,padding:"5px 12px",color:on?"#1A1000":MUTED,fontSize:13,cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:on?700:400}}>{c.sym} {c.label}</button>;})}</div><div style={{display:"flex",flexDirection:"column",gap:12}}>{filtered.map(v=><VerseCard key={v.id} verse={v} expanded={expandedId===v.id} onToggle={()=>setExpandedId(expandedId===v.id?null:v.id)} isFav={favorites.has(v.id)} onFav={onFav}/>)}</div></>)}
      {view==="search"&&<BibleSearchView favorites={favorites} onFav={onFav}/>}
      {view==="favorites"&&(allFavVerses.length===0?<div style={{textAlign:"center",padding:"48px 20px"}}><div style={{fontSize:39,marginBottom:14,opacity:0.25}}></div><div style={{fontFamily:CINZEL,fontSize:16,color:MUTED,letterSpacing:"0.07em",marginBottom:8,textShadow:EMBOSS}}>No favorites yet</div><p style={{fontSize:15,color:MUTED,lineHeight:1.7,fontFamily:"'Lato',sans-serif"}}>Tap the  on any verse to save it here.</p></div>:<div style={{display:"flex",flexDirection:"column",gap:12}}>{allFavVerses.map(v=><div key={v.id} style={{background:CARD,border:`1px solid ${GOLD}30`,borderRadius:16,overflow:"hidden"}}><div onClick={()=>setExpandedId(expandedId===v.id?null:v.id)} style={{padding:"18px 18px 0",cursor:"pointer"}}><div style={{fontFamily:CINZEL,fontSize:16,color:CREAM,lineHeight:1.88,marginBottom:10,textShadow:EMBOSS}}>"{v.text}"</div><div style={{fontFamily:CINZEL,fontSize:13,color:GOLD,fontWeight:700,letterSpacing:"0.16em",marginBottom:14}}>— {v.ref}</div></div>{expandedId===v.id&&<div style={{padding:"0 18px",marginBottom:14}}><p style={{fontSize:15,color:CREAM,lineHeight:1.82,marginBottom:12,fontFamily:"'Lato',sans-serif"}}>{v.explanation}</p><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{v.category.map(c=><Pill key={c} label={c}/>)}</div></div>}<div style={{borderTop:`1px solid ${BORDER}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{fontSize:13,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>Saved</div><button onClick={()=>onFav(v.id)} style={{background:"none",border:`1px solid #4A1A1A`,borderRadius:8,padding:"4px 10px",color:"#A06060",fontSize:13,cursor:"pointer",fontFamily:"'Lato',sans-serif"}}> Remove</button></div></div>)}</div>)}
    </div>
  );
}

//  NOVENA VIEW 
function NovenaView({ onBack }) {
  const [selected,setSelected]=useState(null); const [currentDay,setCurrentDay]=useState(0); const [prayedDays,setPrayedDays]=useState(new Set());
  if (selected) {
    const novena=NOVENAS.find(n=>n.id===selected); const day=novena.days[currentDay]; const hasCompleted=prayedDays.has(`${selected}-${currentDay}`);
    return (
      <div>
        <button onClick={()=>setSelected(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0}}><ChevIco dir="left"/> Back to Novenas</button>
        <div style={{background:novena.color,border:`1px solid ${novena.border}`,borderRadius:18,padding:20,marginBottom:14}}>
          <div style={{fontSize:12,color:novena.accent||GOLD_BRIGHT,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:6}}>Novena</div>
          <div style={{fontFamily:CINZEL,fontSize:19,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:4}}>{novena.title}</div>
          <div style={{fontSize:14,color:novena.accent||GOLD_BRIGHT,fontFamily:CINZEL,letterSpacing:"0.08em",marginBottom:12}}>{novena.subtitle}</div>
          <p style={{fontSize:15,color:CREAM,lineHeight:1.78,fontFamily:"'Lato',sans-serif"}}>{novena.description}</p>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {novena.days.map((_,i)=>{const done=prayedDays.has(`${selected}-${i}`);const active=currentDay===i;return<button key={i} onClick={()=>setCurrentDay(i)} style={{width:36,height:36,borderRadius:"50%",background:active?GOLD:done?"#182818":CARD,border:`1.5px solid ${active?GOLD:done?"#3A9A4A":BORDER}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:active?"#1A1000":done?"#2A8030":MUTED,fontSize:14,fontFamily:CINZEL,fontWeight:active?700:400}}>{done&&!active?"":i+1}</button>;})}
        </div>
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{fontSize:12,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:6}}>Day {currentDay+1}</div>
          <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,textShadow:EMBOSS,marginBottom:4}}>Intention</div>
          <div style={{fontSize:15,color:GOLD,fontFamily:CINZEL,letterSpacing:"0.06em",marginBottom:16}}>{day.intention}</div>
          <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:16}}><div style={{fontSize:12,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:10}}>Prayer</div><div style={{fontFamily:CINZEL,fontSize:14,color:CREAM,lineHeight:2.1,textShadow:EMBOSS,whiteSpace:"pre-line"}}>{day.prayer}</div></div>
        </div>
        <button onClick={()=>setPrayedDays(p=>{const s=new Set(p);hasCompleted?s.delete(`${selected}-${currentDay}`):s.add(`${selected}-${currentDay}`);return s;})} style={{width:"100%",background:hasCompleted?"#0A1A0A":"#181408",border:`1px solid ${hasCompleted?"#3A9A4A":GOLD+"40"}`,borderRadius:14,padding:"13px",color:hasCompleted?"#2A7A30":GOLD_BRIGHT,fontSize:15,fontFamily:CINZEL,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",marginBottom:10}}>{hasCompleted?"  Prayed Today":"Mark as Prayed"}</button>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{if(currentDay>0){setCurrentDay(currentDay-1);setBeads?.(0);}}} disabled={currentDay===0} style={{flex:1,background:CARD,border:`1px solid ${currentDay===0?BORDER:GOLD+"40"}`,borderRadius:12,padding:"12px 0",cursor:currentDay===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:currentDay===0?.35:1}}><ChevIco dir="left"/><span style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>Previous</span></button>
          <button onClick={()=>{if(currentDay<8)setCurrentDay(currentDay+1);}} disabled={currentDay===8} style={{flex:1,background:currentDay===8?CARD:SURFACE,border:`1px solid ${currentDay===8?BORDER:GOLD+"55"}`,borderRadius:12,padding:"12px 0",cursor:currentDay===8?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:currentDay===8?.35:1}}><span style={{fontSize:15,color:currentDay===8?MUTED:GOLD_BRIGHT,fontFamily:"'Lato',sans-serif"}}>{currentDay===8?"Complete":"Next Day"}</span>{currentDay<8&&<ChevIco/>}</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0}}><ChevIco dir="left"/> Back to Prayers</button>
      <div style={{fontFamily:CINZEL,fontSize:19,color:WHITE,fontWeight:600,letterSpacing:"0.07em",marginBottom:4,textShadow:EMBOSS}}>Novenas</div>
      <p style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500,marginBottom:18,lineHeight:1.7}}>A novena is nine days of prayer offered for a particular intention. Select one to begin.</p>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {NOVENAS.map(n=><button key={n.id} onClick={()=>{setSelected(n.id);setCurrentDay(0);}} style={{background:n.color,border:`1px solid ${n.border}`,borderRadius:16,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:3}}>{n.title}</div><div style={{fontSize:14,color:n.accent||GOLD_BRIGHT,fontFamily:CINZEL,letterSpacing:"0.08em",marginBottom:10}}>{n.subtitle}</div><p style={{fontSize:14,color:"#A0988A",lineHeight:1.7,fontFamily:"'Lato',sans-serif"}}>{n.description.substring(0,100)}...</p></div><ChevIco/></div><div style={{marginTop:12,display:"flex",gap:5}}>{Array.from({length:9},(_,i)=><div key={i} style={{width:18,height:4,borderRadius:2,background:prayedDays.has(`${n.id}-${i}`)?"#2A8030":"rgba(255,255,255,0.1)"}}/>)}</div></button>)}
      </div>
    </div>
  );
}

//  THREE O'CLOCK VIEW 
function ThreeOClockView({ onBack }) {
  const [showChaplet,setShowChaplet]=useState(false);
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0}}><ChevIco dir="left"/> Back to Prayers</button>
      <div style={{background:"#F5EEF8",border:"1px solid #9B59C0",borderRadius:20,padding:22,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><div style={{width:44,height:44,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:23}}></div><div><div style={{fontFamily:CINZEL,fontSize:19,color:"#4A2070",fontWeight:600,letterSpacing:"0.07em",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.title}</div><div style={{fontSize:13,color:"#7040A0",letterSpacing:"0.18em",fontFamily:CINZEL,textTransform:"uppercase"}}>{THREE_OCLOCK_PRAYER.subtitle}</div></div></div>
        <div style={{background:"rgba(155,89,192,0.06)",borderRadius:12,padding:14,borderLeft:"3px solid rgba(155,89,192,0.4)"}}><div style={{fontSize:12,color:"#7040A0",letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:8}}>Jesus to Saint Faustina</div><p style={{fontSize:14,color:"#4A2870",lineHeight:1.9,fontFamily:CINZEL,fontStyle:"italic",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.instruction}</p></div>
      </div>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12}}><div style={{fontSize:12,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:12}}>Prayer for the Hour of Mercy</div><div style={{fontFamily:CINZEL,fontSize:15,color:CREAM,lineHeight:2.1,textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.shortPrayer}</div></div>
      <button onClick={()=>setShowChaplet(!showChaplet)} style={{width:"100%",background:showChaplet?"#0A1A0A":"#181408",border:`1px solid ${showChaplet?"#3A9A4A":GOLD+"40"}`,borderRadius:14,padding:"13px",color:showChaplet?"#2A7A30":GOLD_BRIGHT,fontSize:15,fontFamily:CINZEL,fontWeight:600,cursor:"pointer",marginBottom:12}}>{showChaplet?"  Hide Chaplet":"  Full Divine Mercy Chaplet"}</button>
      {showChaplet&&<div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12}}><div style={{fontFamily:CINZEL,fontSize:14,color:CREAM,lineHeight:2.2,whiteSpace:"pre-line",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.chaplet}</div></div>}
      <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:16}}><div style={{fontSize:12,color:GOLD,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:8}}>Catechism of the Catholic Church</div><p style={{fontSize:15,color:"#908878",lineHeight:1.78,fontFamily:"'Lato',sans-serif"}}>{THREE_OCLOCK_PRAYER.ccc}</p></div>
    </div>
  );
}

//  PRAYERS TAB 
function PrayersTab() {
  const [section,setSection]=useState("prayers"); const [subSection,setSubSection]=useState(null); const [expandedPrayer,setExpandedPrayer]=useState(null); const [mysteryType,setMysteryType]=useState("Joyful"); const [decade,setDecade]=useState(0); const [beads,setBeads]=useState(0);
  const PRAYERS=[
    {t:"Our Father",s:"The Lord's Prayer",text:"Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",note:"Taught by Jesus himself in Matthew 6:9–13, this is the foundational prayer of the Christian faith. The CCC calls it 'the summary of the whole gospel' (CCC 2761)."},
    {t:"Hail Mary",s:"Ave Maria",text:"Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",note:"Drawn from Luke 1:28 and 1:42. The CCC affirms that Mary's intercession flows from her divine motherhood (CCC 969)."},
    {t:"Glory Be",s:"Doxology",text:"Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",note:"A short trinitarian doxology prayed at the end of each decade of the Rosary (CCC 2589)."},
    {t:"Act of Contrition",s:"Prayer of Repentance",text:"O my God, I am heartily sorry for having offended Thee, and I detest all my sins because I dread the loss of heaven and the pains of hell, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to confess my sins, to do penance, and to amend my life. Amen.",note:"Traditionally prayed before Confession. The CCC teaches that contrition is 'the most important act of the penitent' (CCC 1451)."},
    {t:"The Angelus",s:"Marian Devotion",text:"The Angel of the Lord declared unto Mary, and she conceived of the Holy Spirit. Hail Mary…\n\nBehold the handmaid of the Lord. Be it done unto me according to Thy word. Hail Mary…\n\nAnd the Word was made flesh, and dwelt among us. Hail Mary…\n\nPray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ.",note:"Traditionally prayed three times a day at 6am, noon, and 6pm. It commemorates the Annunciation (CCC 422)."},
  ];
  const myst=ROSARY[mysteryType]; const curDecade=myst.decades[decade]; const MYSTERY_TYPES=["Joyful","Sorrowful","Glorious","Luminous"];
  if (subSection==="novenas") return <div style={{padding:"0 20px 20px"}}><NovenaView onBack={()=>setSubSection(null)}/></div>;
  if (subSection==="three-oclock") return <div style={{padding:"0 20px 20px"}}><ThreeOClockView onBack={()=>setSubSection(null)}/></div>;
  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{padding:"24px 0 16px",marginTop:"calc(56px + env(safe-area-inset-top))"}}><div style={{fontFamily:CINZEL,fontSize:22,color:WHITE,marginBottom:4,letterSpacing:"0.07em",fontWeight:600,textShadow:EMBOSS}}>{section==="prayers"?"Catholic Prayers":"The Holy Rosary"}</div><div style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>{section==="prayers"?"Traditional prayers of the faith":"A decade-by-decade guide"}</div></div>
      <div style={{display:"flex",background:SURFACE,borderRadius:12,padding:3,marginBottom:18,border:`1px solid ${BORDER}`}}>
        {[{id:"prayers",label:"  Prayers"},{id:"rosary",label:"  Rosary"}].map(t=><button key={t.id} onClick={()=>setSection(t.id)} style={{flex:1,background:section===t.id?CARD:"none",border:section===t.id?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:10,padding:"8px 0",color:section===t.id?GOLD_BRIGHT:MUTED,fontSize:15,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all 0.2s"}}>{t.label}</button>)}
      </div>
      {section==="prayers"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%"}}>
          <button onClick={()=>setSubSection("three-oclock")} style={{background:"#F5EEF8",border:"1px solid #9B59C0",borderRadius:16,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}></div><div><div style={{fontFamily:CINZEL,fontSize:17,color:"#4A2070",fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:2}}>Three O'Clock Prayer</div><div style={{fontSize:13,color:"#7040A0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:CINZEL}}>Hour of Mercy · Divine Mercy Chaplet</div></div></div><ChevIco/></div>{isThreeOClockHour()&&<div style={{marginTop:10,background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.25)",borderRadius:8,padding:"6px 12px",display:"inline-block"}}><span style={{fontSize:13,color:"#7040A0",fontFamily:CINZEL}}> It is the Hour of Mercy now</span></div>}</button>
          <button onClick={()=>setSubSection("novenas")} style={{background:"#F0EAF8",border:`1px solid #8060C0`,borderRadius:16,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:36,height:36,borderRadius:"50%",background:"rgba(100,60,180,0.12)",border:"1px solid rgba(100,60,180,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}></div><div><div style={{fontFamily:CINZEL,fontSize:17,color:"#3A1860",fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:2}}>Novenas</div><div style={{fontSize:13,color:"#6040A0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:CINZEL}}>Nine Days of Prayer · 4 Novenas</div></div></div><ChevIco/></div></button>
          {PRAYERS.map((p,i)=><div key={i} onClick={()=>setExpandedPrayer(expandedPrayer===i?null:i)} style={{background:CARD,border:`1px solid ${expandedPrayer===i?GOLD+"88":BORDER}`,borderRadius:18,padding:20,cursor:"pointer",boxShadow:expandedPrayer===i?CARD_SHADOW_STRONG:CARD_SHADOW,transition:"all 0.2s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontFamily:CINZEL,fontSize:18,color:WHITE,marginBottom:4,letterSpacing:"0.06em",fontWeight:600,textShadow:EMBOSS}}>{p.t}</div><div style={{fontSize:13,color:GOLD,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:CINZEL}}>{p.s}</div></div><span style={{color:MUTED,fontSize:15}}>{expandedPrayer===i?"":""}</span></div>{expandedPrayer===i&&<div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}><div style={{fontFamily:CINZEL,fontSize:14,color:CREAM,lineHeight:2.1,marginBottom:14,letterSpacing:"0.04em",whiteSpace:"pre-line",textShadow:EMBOSS}}>{p.text}</div><div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 8px 8px 0",padding:"10px 14px"}}><div style={{fontSize:12,color:GOLD,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:5}}>Note & CCC</div><p style={{fontSize:14,color:MUTED,lineHeight:1.75,fontFamily:"'Lato',sans-serif"}}>{p.note}</p></div></div>}</div>)}
        </div>
      )}
      {section==="rosary"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>{MYSTERY_TYPES.map(t=>{const m=ROSARY[t];const on=mysteryType===t;return<button key={t} onClick={()=>{setMysteryType(t);setDecade(0);setBeads(0);}} style={{background:on?m.color:CARD,border:`1px solid ${on?m.border:BORDER}`,borderRadius:12,padding:"13px 12px",cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}><div style={{fontFamily:CINZEL,fontSize:15,color:on?WHITE:MUTED,fontWeight:on?600:400,letterSpacing:"0.05em",marginBottom:2,textShadow:on?EMBOSS:"none"}}>{t}</div><div style={{fontSize:12,color:on?"rgba(255,255,255,0.55)":MUTED,fontFamily:"'Lato',sans-serif"}}>{m.day}</div></button>;})}
          </div>
          <div style={{background:myst.color,border:`1px solid ${myst.border}`,borderRadius:20,padding:22,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:12,color:"rgba(255,255,255,0.45)",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL}}>Decade {decade+1} of 5</div><div style={{display:"flex",gap:7}}>{myst.decades.map((_,i)=><div key={i} onClick={()=>{setDecade(i);setBeads(0);}} style={{width:6,height:6,borderRadius:"50%",background:i===decade?GOLD_BRIGHT:"rgba(255,255,255,0.2)",cursor:"pointer"}}/>)}</div></div>
            <div style={{fontFamily:CINZEL,fontSize:18,color:WHITE,fontWeight:600,letterSpacing:"0.06em",marginBottom:4,textShadow:EMBOSS}}>{curDecade.name}</div>
            <div style={{fontSize:13,color:GOLD,marginBottom:14,fontFamily:CINZEL,letterSpacing:"0.12em",fontWeight:700}}>{curDecade.ref}</div>
            <p style={{fontSize:15,color:CREAM,lineHeight:1.85,fontFamily:"'Lato',sans-serif"}}>{curDecade.med}</p>
          </div>
          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:18,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={{fontSize:13,color:MUTED,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:CINZEL}}>Hail Mary</div><div style={{fontFamily:CINZEL,fontSize:15,color:beads===10?GOLD:MUTED,fontWeight:600}}>{beads}/10</div></div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",marginBottom:beads===10?12:0}}>{Array.from({length:10},(_,i)=><div key={i} onClick={()=>setBeads(beads===i+1?i:i+1)} style={{width:30,height:30,borderRadius:"50%",background:i<beads?GOLD:SURFACE,border:`1.5px solid ${i<beads?GOLD_BRIGHT:BORDER}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",fontSize:12,color:i<beads?"#FFFFFF":MUTED,fontWeight:700,fontFamily:CINZEL}}>{i+1}</div>)}</div>
            {beads===10&&<div style={{textAlign:"center",paddingTop:4}}><div style={{fontSize:14,color:GOLD,fontFamily:CINZEL,letterSpacing:"0.08em",textShadow:EMBOSS}}>Glory be to the Father, and to the Son, and to the Holy Spirit.</div></div>}
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{if(decade>0){setDecade(decade-1);setBeads(0);}}} disabled={decade===0} style={{flex:1,background:CARD,border:`1px solid ${decade===0?BORDER:GOLD+"40"}`,borderRadius:12,padding:"12px 0",cursor:decade===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:decade===0?.35:1}}><ChevIco dir="left"/><span style={{fontSize:15,color:MUTED,fontFamily:"'Lato',sans-serif",fontWeight:500}}>Previous</span></button>
            <button onClick={()=>{if(decade<4){setDecade(decade+1);setBeads(0);}}} disabled={decade===4} style={{flex:1,background:decade===4?CARD:SURFACE,border:`1px solid ${decade===4?BORDER:GOLD+"55"}`,borderRadius:12,padding:"12px 0",cursor:decade===4?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:decade===4?.35:1}}><span style={{fontSize:15,color:decade===4?MUTED:GOLD_BRIGHT,fontFamily:"'Lato',sans-serif"}}>{decade===4?"Complete":"Next Decade"}</span>{decade<4&&<ChevIco/>}</button>
          </div>
          {decade===4&&beads===10&&<div style={{background:"#E8F5EA",border:`1px solid #4A9A5A50`,borderRadius:16,padding:20,marginTop:14,textAlign:"center"}}><div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,letterSpacing:"0.08em",marginBottom:8,textShadow:EMBOSS}}>Mystery Complete</div><p style={{fontSize:15,color:"#2A7A30",lineHeight:1.75,fontFamily:"'Lato',sans-serif"}}>You have completed the {mysteryType} Mysteries. May Our Lady carry your intentions before the throne of God. Amen.</p></div>}
        </>
      )}
    </div>
  );
}

//  MASS TAB 
function MassTab() {
  const STREAMS = [
    {
      label: "Vatican News — Papal Mass",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCz6g_U1LHLQNR6vT0ENPMbA",
      note: "Live Masses from St. Peter's Basilica, including Papal celebrations and daily Vatican liturgies.",
      icon: "",
    },
    {
      label: "EWTN — Global Catholic Network",
      embedUrl: "https://www.youtube.com/embed/7RbAWZRMqBI",
      note: "Daily Mass, the Holy Rosary, and Catholic programming broadcast 24 hours a day worldwide.",
      icon: "",
    },
    {
      label: "Salt + Light — Catholic TV",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCHHmjz7kliVPUCkqMxRLWlA",
      note: "Daily Mass and Catholic news from Salt + Light Television in Canada.",
      icon: "",
    },
  ];

  const [selected, setSelected] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const activeStream = selected !== null ? STREAMS[selected] : null;

  return (
    <div style={{ padding: "0 0 20px" }}>
      {/* Header */}
      <div style={{ padding: "24px 20px 20px", marginTop: "calc(56px + env(safe-area-inset-top))", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `${GOLD}18`, border: `1.5px solid ${GOLD}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}></div>
          <div>
            <div style={{ fontFamily: CINZEL, fontSize: 19, color: WHITE, fontWeight: 600, letterSpacing: "0.07em", textShadow: EMBOSS }}>Virtual Mass</div>
            <div style={{ fontSize: 12, color: MUTED, fontFamily: "'Lato',sans-serif", marginTop: 2 }}>Join the celebration of the Eucharist</div>
          </div>
        </div>
      </div>

      {/* Stream list */}
      <div style={{ padding: "18px 20px 0" }}>
        <div style={{ fontSize: 10, color: GOLD_BRIGHT, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: CINZEL, fontWeight: 700, marginBottom: 12 }}>Available Streams</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {STREAMS.map((stream, i) => (
            <button key={i} onClick={() => { setSelected(i); setLoaded(false); }} style={{ background: selected === i ? "linear-gradient(135deg,#FDF6E3,#F5E9C8)" : CARD, border: `1.5px solid ${selected === i ? GOLD : BORDER}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", textAlign: "left", transition: "all 0.2s", boxShadow: selected === i ? CARD_SHADOW_STRONG : CARD_SHADOW }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: selected === i ? `${GOLD}20` : SURFACE, border: `1px solid ${selected === i ? GOLD + "60" : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{stream.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: CINZEL, fontSize: 13, color: selected === i ? GOLD_BRIGHT : WHITE, fontWeight: 600, letterSpacing: "0.05em", textShadow: selected === i ? EMBOSS : "none", marginBottom: 3 }}>{stream.label}</div>
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: "'Lato',sans-serif", lineHeight: 1.5 }}>{stream.note}</div>
                </div>
                {selected === i && <div style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD, flexShrink: 0 }} />}
              </div>
            </button>
          ))}
        </div>

        {/* Player */}
        {activeStream ? (
          <>
            <div style={{ fontSize: 10, color: GOLD_BRIGHT, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: CINZEL, fontWeight: 700, marginBottom: 10 }}>Now Watching</div>
            <div style={{ position: "relative", width: "100%", paddingTop: "56.25%", borderRadius: 16, overflow: "hidden", border: `1.5px solid ${BORDER}`, background: "#0A0806", boxShadow: CARD_SHADOW_STRONG, marginBottom: 14 }}>
              {!loaded && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                  <Cross size={28} />
                  <div style={{ fontFamily: CINZEL, fontSize: 11, color: MUTED, letterSpacing: "0.1em" }}>Loading stream...</div>
                </div>
              )}
              <iframe
                key={activeStream.embedUrl}
                src={activeStream.embedUrl}
                title={activeStream.label}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoaded(true)}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </>
        ) : (
          <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 20px", textAlign: "center", boxShadow: CARD_SHADOW, marginBottom: 14 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}></div>
            <div style={{ fontFamily: CINZEL, fontSize: 14, color: WHITE, fontWeight: 600, letterSpacing: "0.07em", marginBottom: 8, textShadow: EMBOSS }}>Select a Stream Above</div>
            <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.75, fontFamily: "'Lato',sans-serif" }}>Choose one of the available Catholic streams to begin watching Mass online.</p>
          </div>
        )}

        {/* Parish stream note */}
        <div style={{ background: "linear-gradient(135deg,#F5EEF8,#EDE0F5)", border: "1px solid #C0A0D8", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: CARD_SHADOW }}>
          <div style={{ fontSize: 10, color: "#7040A0", letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: CINZEL, fontWeight: 700, marginBottom: 8 }}>Parish Stream — Coming Soon</div>
          <p style={{ fontSize: 12, color: "#4A2870", lineHeight: 1.78, fontFamily: "'Lato',sans-serif" }}>
            A dedicated stream from your parish will be added here once a platform is confirmed. Check back soon — we are working on bringing your local community's Mass directly into the app.
          </p>
        </div>

        {/* Spiritual note */}
        <div style={{ background: "linear-gradient(135deg,#FDF6E3,#F5E9C8)", border: `1px solid ${GOLD}50`, borderRadius: 16, padding: 16, boxShadow: CARD_SHADOW }}>
          <div style={{ fontSize: 10, color: GOLD_BRIGHT, letterSpacing: "0.16em", textTransform: "uppercase", fontFamily: CINZEL, fontWeight: 700, marginBottom: 8 }}>A Note on Virtual Mass</div>
          <p style={{ fontSize: 12, color: CREAM, lineHeight: 1.78, fontFamily: "'Lato',sans-serif" }}>
            The Church encourages physical attendance at Mass whenever possible — it is there we receive Christ truly present in the Eucharist. Watching a live stream is a meaningful act of worship when in-person attendance is not possible. If you are able, please attend Mass at your local parish.
          </p>
        </div>
      </div>
    </div>
  );
}
//  APP SHELL 
export default function BibleApp() {
  const [user, setUser] = useState(null)
  const [userChecked, setUserChecked] = useState(false)
  const [tab, setTab] = useState("home")
  const [favorites, setFavorites] = useState(new Set())
  const [hasNewFavorites, setHasNewFavorites] = useState(false)
  const [showNotifBanner, setShowNotifBanner] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  //  Check Supabase session on load 
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", session.user.id)
            .single()
          setUser({ name: profile?.name || session.user.email.split("@")[0], email: session.user.email })
        } catch {
          setUser({ name: session.user.email.split("@")[0], email: session.user.email })
        }
      }
      setUserChecked(true)
    }).catch(() => {
      setUserChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  //  PWA Install prompt 
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      if (!localStorage.getItem("verbum_install_dismissed")) setShowInstallBanner(true)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  //  Notification setup 
  useEffect(() => {
    if (!user) return
    const permission = getNotificationPermission()
    if (permission === "granted") {
      initNotifications()
    } else if (permission === "default" && !localStorage.getItem("verbum_notif_dismissed")) {
      const t = setTimeout(() => setShowNotifBanner(true), 2000)
      return () => clearTimeout(t)
    }
  }, [user])

  // Deep link navigation from notification tap
  useEffect(() => {
    const handler = (e) => {
      const { tab, section } = e.detail || {}
      if (tab) setTab(tab)
      if (section) localStorage.setItem("verbum_deep_section", section)
    }
    window.addEventListener("verbum-navigate", handler)
    return () => window.removeEventListener("verbum-navigate", handler)
  }, [])

  const onFav = (id) => setFavorites(prev => {
    const next = new Set(prev);
    if (next.has(id)) { next.delete(id); } 
    else { next.add(id); setHasNewFavorites(true); }
    return next;
  })

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === "accepted") { setInstallPrompt(null); setShowInstallBanner(false) }
  }

  const handleSignOut = async () => {
    if (window.confirm("Sign out of Verbum?")) {
      await supabase.auth.signOut()
      setUser(null)
    }
  }

  const TABS = [
    { id: "home",    label: "Home",    I: HomeIco },
    { id: "soul",    label: "Soul",    I: ChatIco },
    { id: "explore", label: "Explore", I: BookIco },
    { id: "prayers", label: "Prayers", I: PrayIco },
    { id: "mass",    label: "Mass",    I: MassIco },
  ]

  const handleTabChange = (id) => {
    setTab(id);
    if (id === "explore") setHasNewFavorites(false);
  }

  //  Wait for session check 
  if (!userChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5EFE4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&display=swap')`}</style>
        <div style={{ textAlign: "center" }}>
          <svg width="32" height="32" viewBox="0 0 20 20" fill="none" style={{ marginBottom: 16 }}>
            <rect x="8.5" y="2" width="3" height="16" rx="1" fill="#9A6B1F"/>
            <rect x="2" y="7.5" width="16" height="3" rx="1" fill="#9A6B1F"/>
          </svg>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: "#A0907A", letterSpacing: "0.1em" }}>Loading...</div>
        </div>
      </div>
    )
  }

  //  Show login if not authenticated 
  if (!user) {
    return <LoginPage onLogin={(u) => setUser(u)} />
  }

  return (
    <div style={{ background: DARK, minHeight: "100vh", width: "100%", fontFamily: "'Lato',-apple-system,sans-serif", color: WHITE, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0}
        textarea::placeholder{color:#B0A090}
        input::placeholder{color:#9A8A74}
        input{font-size:16px !important;-webkit-user-select:text;user-select:text}
        input[type=number]{-moz-appearance:textfield;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        button{font-family:'Lato',-apple-system,sans-serif}
        p{margin:0}
        select option{background:#FFFDF8;color:#1E1208}
        html{touch-action:manipulation}
        body{background:#EDE4D0}
      `}</style>

      <AppHeader tab={tab} user={user} onSignOut={handleSignOut} />
      <div style={{ overflowY: "auto", paddingBottom: 84 }}>
        {showInstallBanner && tab === "home" && (
          <InstallBanner
            onInstall={handleInstall}
            onDismiss={() => { setShowInstallBanner(false); localStorage.setItem("verbum_install_dismissed", "1") }}
          />
        )}
        {showNotifBanner && tab === "home" && (
          <NotificationBanner
            onGranted={async () => {
              setShowNotifBanner(false)
              const { data } = await supabase.auth.getUser()
              if (data?.user?.id) initNotifications(data.user.id)
            }}
            onDismiss={() => { setShowNotifBanner(false); localStorage.setItem("verbum_notif_dismissed", "1") }}
          />
        )}

        {tab === "home"    && <HomeTab favorites={favorites} onFav={onFav} user={user} />}
        {tab === "soul"    && <SoulCheckTab />}
        {tab === "explore" && <ExploreTab favorites={favorites} onFav={onFav} />}
        {tab === "prayers" && <PrayersTab />}
        {tab === "mass"    && <MassTab />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "rgba(245,239,228,0.96)", backdropFilter: "blur(14px)", borderTop: `1px solid ${BORDER}`, display: "flex", padding: "8px 0 12px", boxShadow: "0 -2px 12px rgba(0,0,0,0.07)" }}>
        {TABS.map(({ id, label, I }) => (
          <button key={id} onClick={() => handleTabChange(id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", position: "relative" }}>
            {id === "explore" && hasNewFavorites && (
              <div style={{ position: "absolute", top: 2, right: "calc(50% - 14px)", width: 9, height: 9, borderRadius: "50%", background: "#E53E3E" }} />
            )}
            <I on={tab === id} />
            <span style={{ fontSize: 9, color: tab === id ? GOLD : MUTED, letterSpacing: "0.05em", fontWeight: tab === id ? 700 : 400 }}>{label}</span>
          </button>
        ))}
      </div>


    </div>
  )
}
