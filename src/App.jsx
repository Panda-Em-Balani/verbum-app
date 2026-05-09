import { useState, useEffect, useRef } from "react";

const GOLD = "#9A6B1F";
const GOLD_BRIGHT = "#7A5218";
const DARK = "#F5EFE4";       // page background — warm parchment
const SURFACE = "#EDE5D6";    // slightly deeper parchment
const CARD = "#FFFFFF";       // cards are white
const BORDER = "#D9CEBC";     // soft warm border
const CREAM = "#5A3E1B";      // body text — warm dark brown
const MUTED = "#A0907A";      // muted text
const WHITE = "#2E1F0E";      // headings — deepest brown
const CINZEL = "'Cinzel', serif";
const EMBOSS = "0 1px 0 rgba(255,255,255,0.8), 0 -1px 0 rgba(0,0,0,0.08)";

// ─── VERSES ─────────────────────────────────────────────────────────────────
// Full Bible coverage is handled dynamically via the Claude API in ExploreTab.
// These seed verses are used for the Home tab daily verse picker.
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

// ─── SAINTS ─────────────────────────────────────────────────────────────────
const SAINTS = [
  { name:"Saint Francis of Assisi", feast:{m:10,d:4}, themes:["Nature","Poverty","Peace","Animals"], bio:"Born into wealth in 13th-century Italy, Francis gave up everything to follow Christ radically. He founded the Franciscan Order, composed the Canticle of the Creatures, and received the stigmata.", quote:"Start by doing what is necessary, then what is possible, and suddenly you are doing the impossible." },
  { name:"Saint Teresa of Ávila", feast:{m:10,d:15}, themes:["Prayer","Mysticism","Interior Life","Reform"], bio:"A 16th-century Spanish Carmelite mystic and Doctor of the Church. Her Interior Castle remains one of the greatest works on contemplative prayer. She reformed the Carmelite Order with courage.", quote:"Let nothing disturb you, let nothing frighten you. All things pass. God never changes." },
  { name:"Saint Thérèse of Lisieux", feast:{m:10,d:1}, themes:["Simplicity","Childhood","Suffering","Mission"], bio:"The 'Little Flower,' who died at 24, is a Doctor of the Church. Her 'little way' of spiritual childhood — trusting God completely in small things — has transformed millions.", quote:"Miss no single opportunity of making some small sacrifice, here by a smiling look, there by a kindly word." },
  { name:"Saint Joseph", feast:{m:3,d:19}, themes:["Work","Family","Protection","Fatherhood"], bio:"The earthly father of Jesus and husband of Mary. A carpenter by trade, Joseph protected the Holy Family through the flight into Egypt and raised the Son of God in Nazareth.", quote:"He did as the angel of the Lord commanded him." },
  { name:"Saint Mary Magdalene", feast:{m:7,d:22}, themes:["Repentance","Devotion","Witness","Mercy"], bio:"The first witness of the Resurrection, called 'Apostle to the Apostles' by the Church. Her devotion to Christ never wavered even at the foot of the Cross when the disciples had fled.", quote:"She stood outside the tomb weeping — and then she saw Him." },
  { name:"Saint Augustine", feast:{m:8,d:28}, themes:["Conversion","Grace","Truth","Theology"], bio:"One of the greatest theologians in Church history, Augustine lived a dissolute youth before his dramatic conversion. His Confessions and City of God shaped Western Christianity profoundly.", quote:"Our heart is restless until it rests in Thee." },
  { name:"Saint Monica", feast:{m:8,d:27}, themes:["Mothers","Perseverance","Prayer","Hope"], bio:"Mother of Saint Augustine, Monica prayed and wept for her son's conversion for seventeen years. Her patient, faithful intercession is a model for all who pray for wayward loved ones.", quote:"Nothing is far from God." },
  { name:"Saint Thomas Aquinas", feast:{m:1,d:28}, themes:["Wisdom","Theology","Truth","Study"], bio:"The 'Angelic Doctor,' Thomas was the greatest theologian of the medieval Church. Despite his brilliance, he described all his writings as 'straw' compared to God.", quote:"To one who has faith, no explanation is necessary." },
  { name:"Saint Peter", feast:{m:6,d:29}, themes:["Leadership","Courage","Repentance","Faith"], bio:"The fisherman chosen by Christ as the rock of His Church. Despite his denials, Peter's repentance and restoration by the Risen Christ show that no failure is final in God's mercy.", quote:"Lord, you know everything. You know that I love you." },
  { name:"Saint Paul", feast:{m:6,d:29}, themes:["Mission","Conversion","Courage","Suffering"], bio:"The persecutor turned apostle, Paul spread the Gospel across the known world through extraordinary suffering. His letters form a large portion of the New Testament.", quote:"I can do all things through Christ who strengthens me." },
  { name:"Saint Catherine of Siena", feast:{m:4,d:29}, themes:["Courage","Church","Mysticism","Reform"], bio:"A 14th-century laywoman and Doctor of the Church who convinced the Pope to return to Rome. Her letters and Dialogue remain classics of mystical theology.", quote:"Be who God meant you to be and you will set the world on fire." },
  { name:"Blessed Virgin Mary", feast:{m:8,d:15}, themes:["Faith","Humility","Intercession","Motherhood"], bio:"Mother of God, Queen of Heaven, first disciple of Christ. Mary's 'yes' at the Annunciation opened the door of salvation. In Catholic tradition, she intercedes constantly for her children.", quote:"Do whatever he tells you." },
  { name:"Saint Patrick", feast:{m:3,d:17}, themes:["Mission","Courage","Trinity","Evangelization"], bio:"Captured as a slave in his youth and brought to Ireland, Patrick escaped and later returned as a missionary, evangelizing the entire island.", quote:"Christ with me, Christ before me, Christ behind me." },
  { name:"Saint Ignatius of Loyola", feast:{m:7,d:31}, themes:["Discernment","Mission","Discipline","Spiritual Exercises"], bio:"A Basque soldier whose battlefield conversion led him to found the Jesuits and develop the Spiritual Exercises, a structured retreat still used worldwide.", quote:"Go forth and set the world on fire." },
  { name:"Saint Faustina Kowalska", feast:{m:10,d:5}, themes:["Mercy","Trust","Vision","Divine Mercy"], bio:"A Polish nun to whom Christ appeared and entrusted the message of Divine Mercy. Her diary has become one of the most widely read spiritual books of the 20th century.", quote:"Jesus, I trust in You." },
  { name:"Saint John Paul II", feast:{m:10,d:22}, themes:["Youth","Courage","Truth","Evangelization"], bio:"The beloved Polish pope who served for 27 years, survived an assassination attempt, and helped bring down communism through faith and diplomacy.", quote:"Be not afraid." },
  { name:"Saint Anthony of Padua", feast:{m:6,d:13}, themes:["Lost Things","Preaching","Poverty","Scripture"], bio:"A Portuguese-born Franciscan renowned for powerful preaching and encyclopedic knowledge of Scripture. He is invoked for help finding lost items.", quote:"Actions speak louder than words; let your actions speak." },
  { name:"Saint Michael the Archangel", feast:{m:9,d:29}, themes:["Protection","Courage","Spiritual Warfare","Justice"], bio:"Prince of the heavenly armies and protector of the Church. Michael appears in Scripture driving Satan from heaven, and tradition honors him as defender of souls.", quote:"Who is like God?" },
  { name:"Saint Stephen", feast:{m:12,d:26}, themes:["Martyrdom","Courage","Forgiveness","Witness"], bio:"The first martyr of Christianity, stoned to death for his witness to the Risen Christ. As he died, he prayed for his executioners — echoing Christ on the Cross.", quote:"I see the heavens opened and the Son of Man standing at the right hand of God." },
  { name:"Saint John the Apostle", feast:{m:12,d:27}, themes:["Love","Contemplation","Scripture","Faithfulness"], bio:"The 'Beloved Disciple' who stood at the Cross and received the Blessed Mother into his care. Author of the fourth Gospel, three letters, and Revelation.", quote:"God is love, and whoever abides in love abides in God." },
];

// ─── ROSARY ─────────────────────────────────────────────────────────────────
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

// ─── NOVENAS ─────────────────────────────────────────────────────────────────
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
      {day:1,intention:"All Mankind, especially sinners",prayer:"Most Merciful Jesus, whose very nature it is to have compassion on us and to forgive us, do not look upon our sins but upon our trust which we place in Your infinite goodness. Receive us all into the abode of Your Most Compassionate Heart, and never let us escape from It. We beg this of You by Your love which unites You to the Father and the Holy Spirit. Eternal Father, turn Your merciful gaze upon all mankind and especially poor sinners, all enfolded in the Most Compassionate Heart of Jesus. Amen."},
      {day:2,intention:"Priests and Religious",prayer:"Most Merciful Jesus, from whom comes all that is good, increase Your grace in men and women consecrated to Your service, that they may perform worthy works of mercy; and that all who see them may glorify the Father of Mercy who is in heaven. Amen."},
      {day:3,intention:"Devout and Faithful Souls",prayer:"Most Merciful Jesus, from the treasury of Your mercy, You impart Your graces in great abundance to each and all. Receive us into the abode of Your Most Compassionate Heart and never let us escape from It. We beg this of You by Your love which unites You to the Father and the Holy Spirit. Amen."},
      {day:4,intention:"Pagans and Those Who Do Not Know God",prayer:"Most Merciful Jesus, You are the Light of the whole world. Receive into the abode of Your Most Compassionate Heart the souls of those who do not believe in God and of those who as yet do not know You. Let the rays of Your grace enlighten them. Amen."},
      {day:5,intention:"Heretics and Schismatics",prayer:"Most Merciful Jesus, Goodness Itself, You do not refuse light to those who seek it of You. Receive into the abode of Your Most Compassionate Heart the souls of those who have separated themselves from Your Church. Draw them by Your light into the unity of the Church. Amen."},
      {day:6,intention:"Meek and Humble Souls",prayer:"Most Merciful Jesus, You yourself have said: 'Learn from Me, for I am meek and humble of heart.' Receive into the abode of Your Most Compassionate Heart all meek and humble souls and the souls of little children. These souls send all heaven into ecstasy and they are the Father's favorites. Amen."},
      {day:7,intention:"Souls Who Venerate Divine Mercy",prayer:"Most Merciful Jesus, whose Heart is Love Itself, receive into the abode of Your Most Compassionate Heart the souls of those who particularly extol and venerate the greatness of Your mercy. These souls are mighty with the very power of God Himself. Amen."},
      {day:8,intention:"Souls Detained in Purgatory",prayer:"Most Merciful Jesus, You Yourself have said that You desire mercy; so I bring into the abode of Your Most Compassionate Heart the souls in Purgatory, souls who are very dear to You, and yet who must make retribution to Your justice. May the streams of Blood and Water which gushed forth from Your Heart put out the flames of Purgatory. Amen."},
      {day:9,intention:"Lukewarm Souls",prayer:"Most Compassionate Jesus, You are Compassion Itself. I bring lukewarm souls into the abode of Your Most Compassionate Heart. In this fire of Your pure love, let these tepid souls, who, like corpses, filled You with such deep loathing, be once again set aflame. Amen."},
    ]
  },
  {
    id:"our-lady-guadalupe",
    title:"Novena to Our Lady of Guadalupe",
    subtitle:"Mother of the Americas",
    color:"#EDF5EE",
    border:"#4A9A5A",
    accent:"#2E7A3E",
    description:"Prayed in preparation for the Feast of Our Lady of Guadalupe (December 12), or anytime seeking her maternal intercession. Our Lady appeared to Saint Juan Diego in 1531, leaving her image miraculously imprinted on his tilma.",
    days:[
      {day:1,intention:"Trust in God's Providence",prayer:"Our Lady of Guadalupe, mystical rose, make intercession for Holy Mother Church, protect the Sovereign Pontiff, help all those who invoke thee in their necessities, and since thou art the ever Virgin Mary and Mother of the true God, obtain for us from thy most holy Son the grace of keeping our faith, of sweet hope in the midst of the bitterness of life, of burning charity, and the precious gift of final perseverance. Amen."},
      {day:2,intention:"For the Poor and Forgotten",prayer:"O Mary, you appeared to Juan Diego, a humble man of the people, and made him your messenger. Intercede for all who feel forgotten, overlooked, and without a voice. May they know they are precious in God's sight. Amen."},
      {day:3,intention:"For Families",prayer:"Mother of Guadalupe, you are the Mother of all families. Protect our homes, heal our wounds, and unite us in love. May every family find in you a model of faith and in your Son the source of all grace. Amen."},
      {day:4,intention:"For the Sick",prayer:"Our Lady of Guadalupe, you said 'Am I not here who am your Mother?' Bring that same comfort to all who are sick in body or soul. Be close to them, as a mother is close to a suffering child. Amen."},
      {day:5,intention:"For Vocations",prayer:"O Virgin of Guadalupe, raise up holy priests, consecrated souls, and faithful lay ministers for the Church. May many hearts hear God's call and respond with generosity, as Juan Diego responded to yours. Amen."},
      {day:6,intention:"For the Conversion of Sinners",prayer:"Most holy Virgin, your image has brought millions to faith. Intercede for those who are far from God, that they may be drawn back to His mercy, as flowers turn toward the sun. Amen."},
      {day:7,intention:"For Peace",prayer:"Mother of peace, we live in a world of conflict and division. Obtain from your Son the gift of true peace — in our hearts, in our families, in our nations. Amen."},
      {day:8,intention:"For the Dying",prayer:"Our Lady of Guadalupe, be present at the hour of death to all who have sought your intercession. Lead them gently to the arms of your Son, who is Mercy Itself. Amen."},
      {day:9,intention:"Thanksgiving and Consecration",prayer:"O Most Holy Virgin of Guadalupe, I consecrate to you my mind, my heart, and my will. Take me as your own and present me to your Son Jesus, that He may transform me by His grace. Thank you for your maternal love. Amen."},
    ]
  },
  {
    id:"sacred-heart",
    title:"Novena to the Sacred Heart",
    subtitle:"Nine Days of Love",
    color:"#F8ECEC",
    border:"#C06060",
    accent:"#A04040",
    description:"The Sacred Heart Novena is traditionally prayed before the Feast of the Sacred Heart of Jesus. Jesus promised Saint Margaret Mary Alacoque that He would bless every home in which an image of His Sacred Heart was honored.",
    days:[
      {day:1,intention:"For Love of God",prayer:"O my Jesus, You have said: 'Truly I say to you, ask and it will be given you, seek and you will find, knock and it will be opened to you.' Behold I knock, I seek and ask for the grace of loving You above all things. Sacred Heart of Jesus, I place my trust in You. Amen."},
      {day:2,intention:"For Purity of Heart",prayer:"O Sacred Heart of Jesus, I offer You my heart. Purify it of all that is not of You. Let me love with Your love, see with Your eyes, and serve with Your hands. Amen."},
      {day:3,intention:"For the Church",prayer:"Sacred Heart of Jesus, You love Your Church with a love that passes understanding. Protect her, purify her, and fill her ministers with the fire of Your love. Amen."},
      {day:4,intention:"For Families in Crisis",prayer:"O Heart of Jesus, burning with love for us, inflame our hearts with love for You and for one another. Heal every family broken by sin, sorrow, or separation. Amen."},
      {day:5,intention:"For Sinners",prayer:"Most Sacred Heart of Jesus, in You is consolation for the sorrowful, shelter for the weary, and refuge for the sinner. Be the refuge of all who have wandered far from You. Amen."},
      {day:6,intention:"For the Dying",prayer:"Sacred Heart of Jesus, be with all who are at the threshold of death. May they pass from this life with trust in Your mercy and hope in the resurrection. Amen."},
      {day:7,intention:"For Priests",prayer:"O Heart of Jesus, eternal High Priest, sanctify all your priests. May they be men after Your own Heart, consumed with zeal for souls and alive with Your love. Amen."},
      {day:8,intention:"For the Suffering",prayer:"Gentle Heart of Jesus, become the refuge of all who suffer — the lonely, the sick, the abandoned. Let them feel Your heartbeat close to theirs. Amen."},
      {day:9,intention:"Final Consecration",prayer:"O Sacred Heart of Jesus, to You I consecrate and offer up my person and my life, my actions, trials, and sufferings, that my entire being may henceforth only be employed in loving, honoring, and glorifying You. This is my resolution, my commitment, made with the help of Your grace. Amen."},
    ]
  },
  {
    id:"saint-joseph",
    title:"Novena to Saint Joseph",
    subtitle:"Patron of the Universal Church",
    color:"#EDF4EE",
    border:"#6A9A6A",
    accent:"#50905050",
    description:"Saint Joseph is the patron of the Universal Church, workers, fathers, and a happy death. This novena draws from centuries of devotion to the foster-father of Our Lord Jesus Christ.",
    days:[
      {day:1,intention:"For Fatherhood and Family",prayer:"O Glorious Saint Joseph, faithful guardian of my Redeemer, Jesus Christ, protector of His Virgin Mother, help of all who labor, patron of the dying — I choose you today as my patron and advocate. Pray for my family, that we may imitate the Holy Family of Nazareth. Amen."},
      {day:2,intention:"For Humility",prayer:"Saint Joseph, you were chosen above all men yet you remained hidden and humble. Obtain for me the gift of true humility — to seek to serve rather than be served, to do great things quietly, as you did. Amen."},
      {day:3,intention:"For Trust in Dark Times",prayer:"O Saint Joseph, you did not understand God's plan but you obeyed. When I face confusion and darkness, give me your trusting heart. Help me say yes to God even when I cannot see the way. Amen."},
      {day:4,intention:"For Workers and the Poor",prayer:"Saint Joseph, carpenter of Nazareth, you sanctified ordinary labor by the sweat of your brow. Bless all who work, all who struggle to provide for their families, and all who are without work. Amen."},
      {day:5,intention:"For Purity",prayer:"O chaste guardian of the Virgin, Saint Joseph, obtain for me a heart pure and faithful. In a world that cheapens love, help me to love as you loved — tenderly, protectively, and with holy reverence. Amen."},
      {day:6,intention:"For the Church",prayer:"Saint Joseph, patron of the Universal Church, watch over her as you watched over the Holy Child Jesus. Protect her from every danger, and raise up saints within her walls. Amen."},
      {day:7,intention:"For the Dying",prayer:"O patron of a happy death, Saint Joseph, you died with Jesus and Mary at your side. Be with all who are dying this day. Lead them gently home. Amen."},
      {day:8,intention:"For Courage",prayer:"Mighty Saint Joseph, defender of the Holy Family, be my defender in the spiritual battles of life. When I am tempted, afraid, or persecuted, stand at my side as you stood guard over Jesus and Mary. Amen."},
      {day:9,intention:"Thanksgiving",prayer:"Glorious Saint Joseph, I come to you with gratitude. Thank you for your intercession, your example, and your quiet, powerful love. Present my needs to our Lord Jesus Christ, your foster-Son and my Savior. Amen."},
    ]
  },
];

// ─── THREE O'CLOCK PRAYER ────────────────────────────────────────────────────
const THREE_OCLOCK_PRAYER = {
  title:"The Three O'Clock Hour",
  subtitle:"Hour of Mercy",
  instruction:"At three o'clock, implore My mercy, especially for sinners; and, if only for a brief moment, immerse yourself in My Passion, particularly in My abandonment at the moment of agony. This is the hour of great mercy for the whole world. — Jesus to Saint Faustina",
  shortPrayer:"You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us.",
  chaplet:"V. You expired, O Jesus, but the source of life gushed forth for souls and the ocean of mercy opened up for the whole world.\nR. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us.\n\nFor the sake of His sorrowful Passion, have mercy on us and on the whole world. (×3)\n\nO Blood and Water, which gushed forth from the Heart of Jesus as a font of mercy for us, I trust in You!",
  ccc:"The Catechism of the Catholic Church teaches that prayer is a vital necessity (CCC 2744). The Three O'Clock Hour is a devotion rooted in the hour of Christ's death on the Cross, transforming the moment of His greatest suffering into a perpetual fountain of grace for all who turn to Him with trust.",
};

// ─── CATEGORIES ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  {id:"peace",label:"Peace",sym:"☁"},{id:"hope",label:"Hope",sym:"✦"},
  {id:"love",label:"Love",sym:"♡"},{id:"strength",label:"Strength",sym:"⚡"},
  {id:"comfort",label:"Comfort",sym:"✿"},{id:"trust",label:"Trust",sym:"◎"},
  {id:"grief",label:"Grief",sym:"✧"},{id:"healing",label:"Healing",sym:"✚"},
  {id:"faith",label:"Faith",sym:"✝"},{id:"mercy",label:"Mercy",sym:"◈"},
  {id:"wisdom",label:"Wisdom",sym:"◇"},{id:"renewal",label:"Renewal",sym:"❋"},
];

// ─── ALL BOOKS OF THE CATHOLIC BIBLE ─────────────────────────────────────────
const BIBLE_BOOKS = {
  OT: ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Tobit","Judith","Esther","1 Maccabees","2 Maccabees","Job","Psalms","Proverbs","Ecclesiastes","Song of Songs","Wisdom","Sirach","Isaiah","Jeremiah","Lamentations","Baruch","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"],
  NT: ["Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"],
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getDailyVerse() {
  const day = Math.floor((Date.now()-new Date(new Date().getFullYear(),0,0))/86400000);
  return VERSES[day%VERSES.length];
}
function getSaintOfDay() {
  const now = new Date(); const m=now.getMonth()+1, d=now.getDate();
  const exact = SAINTS.find(s=>s.feast.m===m&&s.feast.d===d);
  if (exact) return exact;
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
function isThreeOClockHour() {
  const now = new Date();
  return now.getHours() === 15;
}

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Cross=({size=20})=><svg width={size} height={size} viewBox="0 0 20 20" fill="none"><rect x="8.5" y="2" width="3" height="16" rx="1" fill={GOLD}/><rect x="2" y="7.5" width="16" height="3" rx="1" fill={GOLD}/></svg>;
const HomeIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2L3 9v11h5v-6h6v6h5V9L11 2z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>;
const ChatIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 5a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H8l-5 4V5z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>;
const BookIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4a2 2 0 012-2h10a2 2 0 012 2v14l-7-3-7 3V4z" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>;
const PrayIco=({on})=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none"/><circle cx="11" cy="11" r="3" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5" fill="none"/><line x1="11" y1="3" x2="11" y2="8" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/><line x1="11" y1="14" x2="11" y2="19" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/><line x1="3" y1="11" x2="8" y2="11" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/><line x1="14" y1="11" x2="19" y2="11" stroke={on?GOLD:"#B8A898"} strokeWidth="1.5"/></svg>;
const RefreshIco=()=><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8a6 6 0 0110.7-3.7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><path d="M14 8a6 6 0 01-10.7 3.7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><polyline points="13,3.5 13,7 9.5,7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><polyline points="3,12.5 3,9 6.5,9" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SendIco=()=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9l14-7-7 14V9H2z" fill={GOLD}/></svg>;
const HeartIco=({filled})=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 15S2 10.5 2 5.5A3.5 3.5 0 019 3.7 3.5 3.5 0 0116 5.5C16 10.5 9 15 9 15z" stroke={filled?GOLD:"#B8A898"} strokeWidth="1.5" fill={filled?GOLD:"none"}/></svg>;
const ChevIco=({dir="right"})=><svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{transform:dir==="left"?"rotate(180deg)":"none"}}><path d="M5 3l4 4-4 4" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const Pill=({label})=><span style={{fontSize:10,background:SURFACE,color:GOLD,padding:"3px 10px",borderRadius:20,letterSpacing:"0.04em",fontFamily:"'Lato',sans-serif",display:"inline-block",border:`1px solid ${BORDER}`}}>{label}</span>;
const LockIco=()=><svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="3" y="8" width="12" height="9" rx="2" stroke={GOLD} strokeWidth="1.5"/><path d="M6 8V5.5a3 3 0 016 0V8" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="12.5" r="1.5" fill={GOLD}/></svg>;

// ─── VERSE CARD ──────────────────────────────────────────────────────────────
function VerseCard({verse,expanded,onToggle,isFav,onFav}) {
  return (
    <div onClick={onToggle} style={{background:CARD,border:`1px solid ${expanded?GOLD+"44":BORDER}`,borderRadius:16,padding:20,cursor:"pointer",transition:"border-color 0.2s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
        <div style={{flex:1}}>
          <div style={{fontFamily:CINZEL,fontSize:13,color:CREAM,lineHeight:1.88,marginBottom:11,letterSpacing:"0.04em",fontWeight:500,textShadow:EMBOSS}}>"{verse.text}"</div>
          <div style={{fontSize:11,color:GOLD,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:CINZEL}}>{verse.ref}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,flexShrink:0}}>
          <span style={{fontSize:11,color:MUTED}}>{expanded?"▲":"▼"}</span>
          <div onClick={e=>{e.stopPropagation();onFav(verse.id);}}><HeartIco filled={isFav}/></div>
        </div>
      </div>
      {expanded&&(
        <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
          <p style={{fontSize:13,color:CREAM,lineHeight:1.85,marginBottom:14}}>{verse.explanation}</p>
          {verse.example&&(
            <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 8px 8px 0",padding:"12px 14px",marginBottom:12}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,letterSpacing:"0.14em",marginBottom:6,textTransform:"uppercase",fontFamily:CINZEL}}>In Practice</div>
              <p style={{fontSize:12,color:MUTED,lineHeight:1.78}}>{verse.example}</p>
            </div>
          )}
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{verse.category.map(c=><Pill key={c} label={c}/>)}</div>
        </div>
      )}
    </div>
  );
}

// ─── PAID USER WARNING MODAL ─────────────────────────────────────────────────
function PaidUserModal({ onClose, onProceed }) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",background:"rgba(200,180,150,0.5)",backdropFilter:"blur(8px)"}}>
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:24,padding:32,maxWidth:360,width:"100%",position:"relative",boxShadow:`0 8px 40px rgba(0,0,0,0.12)`}}>
        {/* Decorative top glow */}
        <div style={{position:"absolute",top:-1,left:"50%",transform:"translateX(-50%)",width:120,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`,borderRadius:2}}/>

        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:56,height:56,borderRadius:"50%",background:`${GOLD}15`,border:`1.5px solid ${GOLD}50`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><LockIco/></div>
          <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,fontWeight:600,letterSpacing:"0.08em",marginBottom:8,textShadow:EMBOSS}}>Soul Check</div>
          <div style={{fontSize:10,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:16}}>Premium Feature</div>
          <p style={{fontSize:13,color:CREAM,lineHeight:1.85,fontFamily:"'Lato',sans-serif"}}>
            Soul Check is available to <strong style={{color:WHITE}}>Verbum Premium</strong> subscribers. This feature provides personalized Scripture reflections and spiritual companionship powered by AI.
          </p>
        </div>

        <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:16,marginBottom:20}}>
          <div style={{fontSize:9,color:GOLD,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:10}}>What's included in Premium</div>
          {["Unlimited Soul Check conversations","Full Bible verse search across all 73 books","Novena progress tracking","Ad-free experience"].map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:i<3?8:0}}>
              <div style={{width:16,height:16,borderRadius:"50%",background:`${GOLD}25`,border:`1px solid ${GOLD}50`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:8,color:GOLD}}>✓</span>
              </div>
              <span style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif"}}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={onProceed} style={{width:"100%",background:`linear-gradient(135deg,${GOLD},#B8923C)`,border:"none",borderRadius:14,padding:"13px",color:"#FFFFFF",fontSize:13,fontFamily:CINZEL,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",boxShadow:`0 4px 20px ${GOLD}30`}}>
            Upgrade to Premium
          </button>
          <button onClick={onClose} style={{width:"100%",background:"none",border:`1px solid ${BORDER}`,borderRadius:14,padding:"12px",color:MUTED,fontSize:12,fontFamily:"'Lato',sans-serif",cursor:"pointer"}}>
            Continue as Free User
          </button>
        </div>

        <p style={{fontSize:10,color:MUTED,textAlign:"center",marginTop:14,fontFamily:"'Lato',sans-serif",lineHeight:1.6}}>
          Free users may explore the Home, Prayers, and Explore tabs without restriction.
        </p>
      </div>
    </div>
  );
}

// ─── THREE O'CLOCK BANNER ────────────────────────────────────────────────────
function ThreeOClockBanner() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{background:"#F5EEF8",border:`1px solid #9B59C0`,borderRadius:18,padding:18,marginBottom:12,position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:"rgba(155,89,192,0.05)"}}/>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
        <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontSize:16}}>🕒</span>
        </div>
        <div>
          <div style={{fontFamily:CINZEL,fontSize:13,color:"#4A2070",fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS}}>The Three O'Clock Hour</div>
          <div style={{fontSize:10,color:"#7040A0",letterSpacing:"0.14em",fontFamily:CINZEL,textTransform:"uppercase"}}>Hour of Mercy</div>
        </div>
      </div>
      <p style={{fontSize:12,color:"#6A4080",lineHeight:1.78,fontFamily:"'Lato',sans-serif",marginBottom:12}}>
        This is the Hour of Mercy — the hour of Christ's death on the Cross. Pause for a moment of prayer.
      </p>
      <div style={{fontFamily:CINZEL,fontSize:11,color:"#4A2870",lineHeight:2.0,letterSpacing:"0.04em",textShadow:EMBOSS,marginBottom:12,fontStyle:"italic"}}>
        "{THREE_OCLOCK_PRAYER.shortPrayer}"
      </div>
      {!expanded&&(
        <button onClick={()=>setExpanded(true)} style={{background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.3)",borderRadius:10,padding:"8px 14px",color:"#7040A0",fontSize:11,cursor:"pointer",fontFamily:CINZEL,letterSpacing:"0.07em"}}>
          + Full Chaplet of Mercy
        </button>
      )}
      {expanded&&(
        <div style={{background:"rgba(155,89,192,0.06)",borderRadius:12,padding:14,marginTop:4,border:"1px solid rgba(155,89,192,0.15)"}}>
          <div style={{fontFamily:CINZEL,fontSize:10,color:"#7040A0",letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:10}}>Divine Mercy Chaplet</div>
          <div style={{fontFamily:CINZEL,fontSize:11,color:"#4A2870",lineHeight:2.1,letterSpacing:"0.03em",whiteSpace:"pre-line",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.chaplet}</div>
          <button onClick={()=>setExpanded(false)} style={{marginTop:12,background:"none",border:"none",color:MUTED,fontSize:11,cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>✕ Close</button>
        </div>
      )}
    </div>
  );
}

// ─── DAILY CATHOLIC HAPPENING ────────────────────────────────────────────────
function DailyCatholicHappening() {
  const [happening, setHappening] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const today = new Date();
    const cacheKey = `verbum-happening-${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) { setHappening(JSON.parse(cached)); setLoading(false); return; }

    const dateStr = today.toLocaleDateString("en-US",{month:"long",day:"numeric"});
    fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:1000,
        system:`You generate a single Catholic "Good to Know" trivia card for today's date. 
        
Your response must be a single valid JSON object with these exact fields:
{
  "title": "short catchy title (max 6 words)",
  "type": "one of: Feast Day, Historical Moment, Marian Apparition, Papal Event, Martyrdom, Miracle, Church Teaching, Canonization",
  "year": "the year this happened (or empty string if it's a recurring observance)",
  "body": "2-3 sentences explaining the significance. Warm, accessible, educational tone. Grounded in Catholic tradition.",
  "ccc": "one sentence connecting this to a teaching from the Catechism of the Catholic Church (CCC), include the CCC paragraph number if relevant.",
  "emoji": "one relevant emoji"
}

Return ONLY the JSON object. No preamble, no markdown backticks, no extra text.`,
        messages:[{role:"user",content:`Today is ${dateStr}. What is a notable Catholic happening, feast day, historical moment, or spiritual significance for this date? Generate the JSON card.`}]
      })
    })
    .then(r=>r.json())
    .then(data=>{
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      sessionStorage.setItem(cacheKey, JSON.stringify(parsed));
      setHappening(parsed);
      setLoading(false);
    })
    .catch(()=>{ setLoading(false); });
  },[]);

  if (loading) return (
    <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12,display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
      <div style={{width:36,height:36,borderRadius:"50%",background:`${GOLD}15`,border:`1px solid ${GOLD}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <span style={{fontSize:14}}>📅</span>
      </div>
      <div>
        <div style={{fontFamily:CINZEL,fontSize:11,color:MUTED,letterSpacing:"0.06em"}}>Loading today's happening...</div>
      </div>
    </div>
  );
  if (!happening) return null;

  return (
    <div style={{background:"#FFFBF2",border:`1px solid #D4B97A`,borderRadius:18,padding:20,marginBottom:12,position:"relative",overflow:"hidden",boxShadow:"0 1px 6px rgba(180,140,60,0.08)"}}>
      <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(180,140,60,0.05)"}}/>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
        <div style={{width:40,height:40,borderRadius:12,background:`${GOLD}15`,border:`1px solid ${GOLD}40`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>
          {happening.emoji||"✝"}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:9,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:4}}>
            ✦ Today in the Church {happening.year?`· ${happening.year}`:""}
          </div>
          <div style={{fontFamily:CINZEL,fontSize:14,color:WHITE,fontWeight:600,letterSpacing:"0.05em",lineHeight:1.4,textShadow:EMBOSS}}>{happening.title}</div>
        </div>
      </div>

      {/* Type badge */}
      {happening.type&&(
        <div style={{display:"inline-block",background:`${GOLD}15`,border:`1px solid ${GOLD}40`,borderRadius:20,padding:"3px 12px",marginBottom:12}}>
          <span style={{fontSize:10,color:GOLD,fontFamily:CINZEL,letterSpacing:"0.1em"}}>{happening.type}</span>
        </div>
      )}

      {/* Body */}
      <p style={{fontSize:12,color:CREAM,lineHeight:1.85,fontFamily:"'Lato',sans-serif",marginBottom:12}}>{happening.body}</p>

      {/* CCC connection */}
      {happening.ccc&&(
        <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}80`,borderRadius:"0 10px 10px 0",padding:"10px 14px"}}>
          <div style={{fontSize:9,color:GOLD,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:5}}>Catechism Connection</div>
          <p style={{fontSize:11,color:MUTED,lineHeight:1.75,fontFamily:"'Lato',sans-serif"}}>{happening.ccc}</p>
        </div>
      )}
    </div>
  );
}

// ─── HOME TAB ────────────────────────────────────────────────────────────────
function HomeTab({favorites,onFav}) {
  const [verse,setVerse]=useState(getDailyVerse());
  const [expanded,setExpanded]=useState(false);
  const [refreshing,setRefreshing]=useState(false);
  const [showFavPanel,setShowFavPanel]=useState(false);
  const [usedIds,setUsedIds]=useState(new Set([getDailyVerse().id]));
  const [time,setTime]=useState(new Date());

  useEffect(()=>{
    const t=setInterval(()=>setTime(new Date()),1000);
    return ()=>clearInterval(t);
  },[]);

  const saint=getSaintOfDay();
  const season=getLiturgicalSeason();
  const h=time.getHours();
  const is3oclock=isThreeOClockHour();
  const moment=h<12?{g:"Good Morning",p:"Morning Prayer",l:"Begin this day in God's presence."}:h<17?{g:"Good Afternoon",p:"Midday Prayer",l:"Pause and rest in the Lord."}:{g:"Good Evening",p:"Evening Prayer",l:"Give thanks for this day."};
  const dateStr=time.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const timeStr=time.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit",hour12:true});
  const isFav=favorites.has(verse.id);

  const refresh=()=>{
    setRefreshing(true);
    setTimeout(()=>{
      const pool=VERSES.filter(v=>!usedIds.has(v.id)||usedIds.size>=VERSES.length);
      const next=(pool.length?pool:VERSES)[Math.floor(Math.random()*(pool.length||VERSES.length))];
      setVerse(next);setExpanded(false);setShowFavPanel(false);
      setUsedIds(p=>{const s=new Set(p.size>=VERSES.length?[]:p);s.add(next.id);return s;});
      setRefreshing(false);
    },400);
  };

  const S={
    sectionLabel:{fontSize:9,color:GOLD,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:12,fontFamily:CINZEL},
    card:{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"},
  };

  return (
    <div style={{padding:"0 20px 20px"}}>
      {/* Header */}
      <div style={{textAlign:"center",padding:"26px 0 20px"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Cross size={28}/></div>
        <div style={{fontSize:10,color:MUTED,letterSpacing:"0.18em",textTransform:"uppercase",marginBottom:2}}>{dateStr}</div>
        <div style={{fontSize:13,color:MUTED,fontFamily:"'Lato',sans-serif",marginBottom:8,letterSpacing:"0.06em"}}>{timeStr}</div>
        <div style={{fontFamily:CINZEL,fontSize:22,color:WHITE,marginBottom:4,letterSpacing:"0.08em",fontWeight:600,textShadow:EMBOSS}}>{moment.g}</div>
        <div style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif"}}>{moment.l}</div>
      </div>

      {/* ── DAILY VERSE FIRST ── */}
      <div style={{background:"#FBF6ED",border:`1px solid #D4B97A`,borderRadius:20,padding:22,marginBottom:10,position:"relative",overflow:"hidden",boxShadow:"0 2px 8px rgba(180,140,60,0.10)"}}>
        <div style={{position:"absolute",top:-24,right:-24,width:80,height:80,borderRadius:"50%",background:"rgba(180,140,60,0.07)"}}/>
        <div style={S.sectionLabel}>✦ Daily Verse</div>
        <div style={{fontFamily:CINZEL,fontSize:14,color:"#4A3010",lineHeight:1.92,marginBottom:14,letterSpacing:"0.04em",fontWeight:500,textShadow:EMBOSS}}>"{verse.text}"</div>
        <div style={{fontFamily:CINZEL,fontSize:10,color:GOLD,fontWeight:700,letterSpacing:"0.16em"}}>— {verse.ref}</div>
      </div>

      {/* Action row */}
      <div style={{display:"flex",gap:8,marginBottom:showFavPanel||expanded?8:14}}>
        <button onClick={()=>{setExpanded(!expanded);setShowFavPanel(false);}} style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:12,padding:"11px 0",color:WHITE,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Lato',sans-serif",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
          <span>📖</span>{expanded?"Hide":"Read"} Explanation
        </button>
        <button onClick={()=>{setShowFavPanel(!showFavPanel);setExpanded(false);}} style={{background:CARD,border:`1px solid ${isFav?GOLD+"88":BORDER}`,borderRadius:12,padding:"11px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:6,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
          <HeartIco filled={isFav}/><span style={{fontSize:12,color:isFav?GOLD:MUTED,fontFamily:"'Lato',sans-serif"}}>{isFav?"Saved":"Save"}</span>
        </button>
        <button onClick={refresh} disabled={refreshing} style={{background:CARD,border:`1px solid ${GOLD}60`,borderRadius:12,padding:"11px 14px",cursor:"pointer",opacity:refreshing?.5:1,transition:"opacity 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>
          <RefreshIco/>
        </button>
      </div>

      {expanded&&(
        <div style={{...S.card,marginBottom:12}}>
          <p style={{fontSize:13,color:CREAM,lineHeight:1.85,marginBottom:16}}>{verse.explanation}</p>
          {verse.example&&(
            <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 10px 10px 0",padding:"13px 16px"}}>
              <div style={{fontSize:10,color:GOLD,fontWeight:700,letterSpacing:"0.14em",marginBottom:7,textTransform:"uppercase",fontFamily:CINZEL}}>In Practice</div>
              <p style={{fontSize:12,color:MUTED,lineHeight:1.78}}>{verse.example}</p>
            </div>
          )}
        </div>
      )}

      {showFavPanel&&(
        <div style={{background:"#FDF8F0",border:`1px solid ${GOLD}60`,borderRadius:14,padding:16,marginBottom:12}}>
          <p style={{fontSize:12,color:MUTED,marginBottom:12,fontFamily:"'Lato',sans-serif",lineHeight:1.6}}>{isFav?"This verse is already in your Favorites collection in the Explore tab.":"Add this verse to your personal Favorites collection."}</p>
          <button onClick={()=>{onFav(verse.id);setShowFavPanel(false);}} style={{width:"100%",background:isFav?"#FFF0F0":"#F0FFF4",border:`1px solid ${isFav?"#E08080":"#80C080"}`,borderRadius:10,padding:"10px",color:isFav?"#C06060":GOLD,fontSize:12,cursor:"pointer",fontFamily:CINZEL,letterSpacing:"0.07em",fontWeight:600}}>
            {isFav?"♡  Remove from Favorites":"♡  Add to Favorites"}
          </button>
        </div>
      )}

      {/* Three O'Clock Banner — only shown at 3PM */}
      {is3oclock && <ThreeOClockBanner />}

      {/* Daily Catholic Happening */}
      <DailyCatholicHappening />

      {/* Liturgical Season */}
      <div style={{background:season.bg,border:`1px solid ${season.border}`,borderRadius:16,padding:18,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{...S.sectionLabel,marginBottom:0}}>Liturgical Season</div>
          <div style={{width:8,height:8,borderRadius:"50%",background:season.light}}/>
        </div>
        <div style={{fontFamily:CINZEL,fontSize:16,color:WHITE,fontWeight:600,letterSpacing:"0.08em",marginBottom:6,textShadow:EMBOSS}}>{season.name}</div>
        <p style={{fontSize:12,color:CREAM,lineHeight:1.75,marginBottom:12,fontFamily:"'Lato',sans-serif"}}>{season.desc}</p>
        <div style={{fontSize:9,color:season.light,letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:8,fontFamily:CINZEL}}>Related Themes</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {season.cats.map(c=><span key={c} style={{fontSize:10,background:"rgba(255,255,255,0.6)",color:season.light,padding:"3px 10px",borderRadius:20,fontFamily:"'Lato',sans-serif",border:`1px solid ${season.border}`}}>{c}</span>)}
        </div>
      </div>

      {/* Saint of the Day */}
      <div style={S.card}>
        <div style={S.sectionLabel}>✦ Saint of the Day</div>
        <div style={{fontFamily:CINZEL,fontSize:15,color:WHITE,fontWeight:600,letterSpacing:"0.06em",marginBottom:3,textShadow:EMBOSS}}>{saint.name}</div>
        <div style={{fontSize:10,color:MUTED,marginBottom:10,fontFamily:"'Lato',sans-serif"}}>
          Feast Day: {new Date(2024,saint.feast.m-1,saint.feast.d).toLocaleDateString("en-US",{month:"long",day:"numeric"})}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:12}}>{saint.themes.map(t=><Pill key={t} label={t}/>)}</div>
        <p style={{fontSize:12,color:CREAM,lineHeight:1.82,marginBottom:14,fontFamily:"'Lato',sans-serif"}}>{saint.bio}</p>
        <div style={{borderLeft:`3px solid ${GOLD}`,padding:"10px 14px",background:SURFACE,borderRadius:"0 8px 8px 0"}}>
          <div style={{fontFamily:CINZEL,fontSize:12,color:"#4A3010",lineHeight:1.85,fontWeight:400,textShadow:EMBOSS}}>"{saint.quote}"</div>
        </div>
      </div>

      {/* Time-of-day prayer */}
      <div style={S.card}>
        <div style={S.sectionLabel}>{moment.p}</div>
        <div style={{fontFamily:CINZEL,fontSize:11,color:CREAM,lineHeight:2.1,letterSpacing:"0.04em",fontWeight:400,textShadow:EMBOSS}}>
          Lord, may Your Word be a lamp to my feet and a light to my path today. Guide my thoughts, my words, and my actions, that I may walk in Your ways. Amen.
        </div>
      </div>
    </div>
  );
}

// ─── SOUL CHECK TAB ──────────────────────────────────────────────────────────
function SoulCheckTab() {
  const [messages,setMessages]=useState([{role:"assistant",content:"Peace be with you.\n\nHow is your heart today? Whatever you are carrying — joy, worry, grief, gratitude — share it with me. I am here to walk alongside you with God's Word."}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const [showGuide,setShowGuide]=useState(true);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages,loading]);

  const PAYWALL_MSG = "Soul Check is a feature for Verbum Premium users. To receive personalized Scripture reflections and spiritual companionship, please upgrade to a Premium account.";

  const send=async()=>{
    const text=input.trim();if(!text||loading)return;
    setInput("");setShowGuide(false);
    const updated=[...messages,{role:"user",content:text}];
    setMessages(updated);setLoading(true);
    // Simulate brief delay then return paywall message
    await new Promise(r=>setTimeout(r,800));
    setMessages([...updated,{role:"assistant",content:PAYWALL_MSG,isPaywall:true}]);
    setLoading(false);
  };

  const MOODS=["Anxious","Grateful","Lonely","Hopeful","Grieving","Lost","Peaceful","Struggling"];
  const EXAMPLES=["I am feeling anxious about something difficult","I want to give thanks for a beautiful moment","I lost someone and I am trying to grieve well"];

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)",minHeight:520}}>
      <div style={{padding:"20px 20px 0",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,marginBottom:3,letterSpacing:"0.07em",fontWeight:600,textShadow:EMBOSS}}>Soul Check</div>
        <div style={{fontSize:12,color:MUTED,marginBottom:12,fontFamily:"'Lato',sans-serif"}}>Share your heart — receive God's Word</div>

        {showGuide&&(
          <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:12,padding:14,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:9,color:GOLD,fontWeight:700,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL}}>How This Works</div>
              <button onClick={()=>setShowGuide(false)} style={{background:"none",border:"none",color:MUTED,fontSize:15,cursor:"pointer",lineHeight:1,padding:"0 2px"}}>✕</button>
            </div>
            <p style={{fontSize:12,color:CREAM,lineHeight:1.78,marginBottom:10,fontFamily:"'Lato',sans-serif"}}>
              Share how you are feeling — in a single word or full sentences. You will receive a <strong style={{color:WHITE,fontWeight:700}}>relevant Scripture verse</strong>, a warm reflection grounded in the <strong style={{color:WHITE,fontWeight:700}}>Catechism of the Catholic Church</strong>, and a short prayer tailored to your moment.
            </p>
            <div style={{fontSize:10,color:MUTED,marginBottom:7,fontFamily:CINZEL,letterSpacing:"0.08em",fontWeight:600}}>Try saying:</div>
            {EXAMPLES.map(ex=>(
              <button key={ex} onClick={()=>{setInput(ex);setShowGuide(false);}} style={{display:"block",width:"100%",textAlign:"left",background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,padding:"7px 12px",color:CREAM,fontSize:11,cursor:"pointer",fontFamily:"'Lato',sans-serif",lineHeight:1.55,marginBottom:5}}>"{ex}"</button>
            ))}
          </div>
        )}

        {messages.length===1&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:6,paddingBottom:14}}>
            {MOODS.map(m=><button key={m} onClick={()=>setInput(m)} style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:20,padding:"5px 12px",color:CREAM,fontSize:11,cursor:"pointer",fontFamily:"'Lato',sans-serif"}}>{m}</button>)}
          </div>
        )}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 20px",background:DARK}}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:16}}>
            {m.role==="assistant"&&<div style={{width:28,height:28,borderRadius:"50%",background:`${GOLD}20`,border:`1px solid ${GOLD}50`,display:"flex",alignItems:"center",justifyContent:"center",marginRight:10,flexShrink:0,marginTop:2}}><Cross size={12}/></div>}
            <div style={{maxWidth:"78%",background:m.role==="user"?GOLD:CARD,border:m.role==="user"?"none":`1px solid ${m.isPaywall?"#D4A820":BORDER}`,borderRadius:m.role==="user"?"18px 18px 4px 18px":"4px 18px 18px 18px",padding:"12px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.07)"}}>
              <div style={{fontSize:12,color:m.role==="user"?"#FFFFFF":m.isPaywall?GOLD:CREAM,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:m.role==="assistant"?CINZEL:"'Lato',sans-serif",letterSpacing:m.role==="assistant"?"0.03em":"normal",textShadow:m.role==="assistant"?EMBOSS:"none",fontWeight:400}}>{m.content}</div>
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:10,marginBottom:16}}><div style={{width:28,height:28,borderRadius:"50%",background:`${GOLD}20`,border:`1px solid ${GOLD}50`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Cross size={12}/></div><div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:"4px 18px 18px 18px",padding:"14px 18px",display:"flex",gap:5,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:GOLD,animation:`pulse 1.4s ease-in-out ${i*0.2}s infinite`}}/>)}</div></div>}
        <div ref={bottomRef}/>
      </div>

      <div style={{padding:"10px 14px",borderTop:`1px solid ${BORDER}`,background:CARD,display:"flex",gap:10,alignItems:"flex-end"}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="How are you feeling today?" rows={1} style={{flex:1,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:18,padding:"10px 16px",color:WHITE,fontSize:13,resize:"none",outline:"none",fontFamily:"'Lato',sans-serif",lineHeight:1.5,maxHeight:100}}/>
        <button onClick={send} disabled={!input.trim()||loading} style={{width:40,height:40,borderRadius:"50%",background:input.trim()&&!loading?GOLD:SURFACE,border:`1px solid ${input.trim()&&!loading?GOLD:BORDER}`,cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s",flexShrink:0}}><SendIco/></button>
      </div>
      <style>{`@keyframes pulse{0%,80%,100%{opacity:0.2;transform:scale(0.8)}40%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ─── BIBLE SEARCH (EXPLORE) ──────────────────────────────────────────────────
function BibleSearchView({ favorites, onFav }) {
  const [searchBook, setSearchBook] = useState("");
  const [searchChapter, setSearchChapter] = useState("");
  const [searchVerse, setSearchVerse] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testament, setTestament] = useState("NT");

  const fetchVerse = async () => {
    if (!searchBook) return;
    setLoading(true); setResult(null);
    const ref = `${searchBook}${searchChapter?" "+searchChapter:""}${searchVerse?":"+searchVerse:""}`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`You are a Catholic Scripture resource sourcing from the full Catholic Bible (all 73 books, including the deuterocanonical books). Your content is grounded in the Catechism of the Catholic Church (CCC).

When given a Scripture reference, return a JSON object with:
{
  "ref": "the full reference e.g. John 3:16",
  "text": "the verse text in the New American Bible (NAB) translation",
  "context": "1-2 sentences of historical or literary context",
  "reflection": "2-3 sentences of Catholic spiritual reflection grounded in Church teaching",
  "ccc": "one sentence connecting to a specific CCC paragraph if relevant (include number), or empty string",
  "categories": ["array","of","relevant","themes"]
}

If a whole chapter is requested (no verse number), provide a summary and a representative verse.
Return ONLY the JSON. No markdown, no preamble.`,
          messages:[{role:"user",content:`Give me the verse and reflection for: ${ref}`}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text||"{}";
      const clean = text.replace(/```json|```/g,"").trim();
      setResult(JSON.parse(clean));
    } catch(e) { setResult({ref,text:"Unable to retrieve this verse. Please check the reference and try again.",context:"",reflection:"",ccc:"",categories:[]}); }
    setLoading(false);
  };

  const books = BIBLE_BOOKS[testament];

  return (
    <div>
      <div style={{fontSize:9,color:MUTED,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:10}}>Search Any Verse</div>

      {/* Testament toggle */}
      <div style={{display:"flex",background:SURFACE,borderRadius:10,padding:3,marginBottom:12,border:`1px solid ${BORDER}`}}>
        {["OT","NT"].map(t=>(
          <button key={t} onClick={()=>{setTestament(t);setSearchBook("");}} style={{flex:1,background:testament===t?CARD:"none",border:testament===t?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:8,padding:"7px 0",color:testament===t?GOLD_BRIGHT:MUTED,fontSize:11,cursor:"pointer",fontFamily:CINZEL,letterSpacing:"0.07em",transition:"all 0.2s"}}>
            {t==="OT"?"Old Testament":"New Testament"}
          </button>
        ))}
      </div>

      {/* Book selector */}
      <select value={searchBook} onChange={e=>setSearchBook(e.target.value)} style={{width:"100%",background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 14px",color:searchBook?WHITE:MUTED,fontSize:13,marginBottom:10,outline:"none",fontFamily:"'Lato',sans-serif",appearance:"none"}}>
        <option value="">Select a Book...</option>
        {books.map(b=><option key={b} value={b}>{b}</option>)}
      </select>

      {/* Chapter & Verse */}
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <input value={searchChapter} onChange={e=>setSearchChapter(e.target.value)} placeholder="Chapter" type="number" min="1" style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 14px",color:WHITE,fontSize:13,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
        <input value={searchVerse} onChange={e=>setSearchVerse(e.target.value)} placeholder="Verse" type="number" min="1" style={{flex:1,background:CARD,border:`1px solid ${BORDER}`,borderRadius:10,padding:"10px 14px",color:WHITE,fontSize:13,outline:"none",fontFamily:"'Lato',sans-serif"}}/>
        <button onClick={fetchVerse} disabled={!searchBook||loading} style={{background:searchBook&&!loading?GOLD:CARD,border:`1px solid ${searchBook&&!loading?GOLD:BORDER}`,borderRadius:10,padding:"10px 16px",color:searchBook&&!loading?"#1A1000":MUTED,fontSize:12,cursor:searchBook&&!loading?"pointer":"default",fontFamily:CINZEL,letterSpacing:"0.05em",fontWeight:600,transition:"all 0.2s",flexShrink:0}}>
          {loading?"...":"Search"}
        </button>
      </div>

      {result&&(
        <div style={{background:"#FFFBF2",border:`1px solid ${GOLD}60`,borderRadius:16,padding:20,boxShadow:"0 1px 6px rgba(180,140,60,0.08)"}}>
          <div style={{fontFamily:CINZEL,fontSize:10,color:GOLD,letterSpacing:"0.16em",fontWeight:700,marginBottom:10,textTransform:"uppercase"}}>{result.ref}</div>
          <div style={{fontFamily:CINZEL,fontSize:13,color:"#4A3010",lineHeight:1.9,marginBottom:14,letterSpacing:"0.04em",fontWeight:500,textShadow:EMBOSS}}>"{result.text}"</div>
          {result.context&&<p style={{fontSize:12,color:MUTED,lineHeight:1.78,marginBottom:12,fontFamily:"'Lato',sans-serif",fontStyle:"italic"}}>{result.context}</p>}
          {result.reflection&&<p style={{fontSize:12,color:CREAM,lineHeight:1.85,marginBottom:12,fontFamily:"'Lato',sans-serif"}}>{result.reflection}</p>}
          {result.ccc&&(
            <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}80`,borderRadius:"0 8px 8px 0",padding:"10px 14px",marginBottom:12}}>
              <div style={{fontSize:9,color:GOLD,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:4}}>Catechism (CCC)</div>
              <p style={{fontSize:11,color:MUTED,lineHeight:1.75,fontFamily:"'Lato',sans-serif"}}>{result.ccc}</p>
            </div>
          )}
          {result.categories&&result.categories.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{result.categories.map(c=><Pill key={c} label={c}/>)}</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── EXPLORE TAB ─────────────────────────────────────────────────────────────
function ExploreTab({favorites,onFav}) {
  const [view,setView]=useState("browse");
  const [selectedCat,setSelectedCat]=useState(null);
  const [expandedId,setExpandedId]=useState(null);
  const filtered=selectedCat?VERSES.filter(v=>v.category.includes(selectedCat)):VERSES;
  const favVerses=VERSES.filter(v=>favorites.has(v.id));

  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{padding:"24px 0 16px"}}>
        <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,marginBottom:3,letterSpacing:"0.07em",fontWeight:600,textShadow:EMBOSS}}>
          {view==="browse"?"Verse Library":view==="search"?"Bible Search":"My Favorites"}
        </div>
        <div style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif"}}>
          {view==="browse"?"Browse by theme or feeling":view==="search"?"All 73 books of the Catholic Bible":"Your personal collection"}
        </div>
      </div>

      {/* Toggle — 3 tabs */}
      <div style={{display:"flex",background:SURFACE,borderRadius:12,padding:3,marginBottom:18,border:`1px solid ${BORDER}`,gap:2}}>
        {[{id:"browse",label:"📖 Browse"},{id:"search",label:"🔍 Bible"},{id:"favorites",label:`♡ Saved${favVerses.length?" ("+favVerses.length+")":""}`}].map(t=>(
          <button key={t.id} onClick={()=>{setView(t.id);setExpandedId(null);}} style={{flex:1,background:view===t.id?CARD:"none",border:view===t.id?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:10,padding:"8px 0",color:view===t.id?GOLD_BRIGHT:MUTED,fontSize:11,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all 0.2s"}}>{t.label}</button>
        ))}
      </div>

      {view==="browse"&&(
        <>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
            <button onClick={()=>setSelectedCat(null)} style={{background:!selectedCat?GOLD:CARD,border:`1px solid ${!selectedCat?GOLD:BORDER}`,borderRadius:20,padding:"5px 14px",color:!selectedCat?"#1A1000":MUTED,fontSize:10,cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:!selectedCat?700:400}}>All</button>
            {CATEGORIES.map(c=>{const on=selectedCat===c.id;return<button key={c.id} onClick={()=>setSelectedCat(on?null:c.id)} style={{background:on?GOLD:CARD,border:`1px solid ${on?GOLD:BORDER}`,borderRadius:20,padding:"5px 12px",color:on?"#1A1000":MUTED,fontSize:10,cursor:"pointer",fontFamily:"'Lato',sans-serif",fontWeight:on?700:400}}>{c.sym} {c.label}</button>;})}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {filtered.map(v=><VerseCard key={v.id} verse={v} expanded={expandedId===v.id} onToggle={()=>setExpandedId(expandedId===v.id?null:v.id)} isFav={favorites.has(v.id)} onFav={onFav}/>)}
          </div>
        </>
      )}

      {view==="search"&&(
        <BibleSearchView favorites={favorites} onFav={onFav}/>
      )}

      {view==="favorites"&&(
        favVerses.length===0?(
          <div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:14,opacity:0.25}}>♡</div>
            <div style={{fontFamily:CINZEL,fontSize:13,color:MUTED,letterSpacing:"0.07em",marginBottom:8,textShadow:EMBOSS}}>No favorites yet</div>
            <p style={{fontSize:12,color:MUTED,lineHeight:1.7,fontFamily:"'Lato',sans-serif"}}>Tap the ♡ on any verse in Browse or on the Daily Verse card to save it to your collection.</p>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {favVerses.map(v=>(
              <div key={v.id} style={{background:CARD,border:`1px solid ${GOLD}30`,borderRadius:16,overflow:"hidden"}}>
                <div onClick={()=>setExpandedId(expandedId===v.id?null:v.id)} style={{padding:"18px 18px 0",cursor:"pointer"}}>
                  <div style={{fontFamily:CINZEL,fontSize:13,color:CREAM,lineHeight:1.88,marginBottom:10,letterSpacing:"0.04em",fontWeight:500,textShadow:EMBOSS}}>"{v.text}"</div>
                  <div style={{fontFamily:CINZEL,fontSize:10,color:GOLD,fontWeight:700,letterSpacing:"0.16em",marginBottom:14}}>— {v.ref}</div>
                </div>
                {expandedId===v.id&&(
                  <div style={{padding:"0 18px",marginBottom:14}}>
                    <p style={{fontSize:12,color:CREAM,lineHeight:1.82,marginBottom:12,fontFamily:"'Lato',sans-serif"}}>{v.explanation}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{v.category.map(c=><Pill key={c} label={c}/>)}</div>
                  </div>
                )}
                <div style={{borderTop:`1px solid ${BORDER}`,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{fontSize:10,color:MUTED,fontFamily:"'Lato',sans-serif"}}>Saved to collection</div>
                  <button onClick={()=>onFav(v.id)} style={{background:"none",border:`1px solid #4A1A1A`,borderRadius:8,padding:"4px 10px",color:"#A06060",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"'Lato',sans-serif"}}>✕ Remove</button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── NOVENA VIEW ─────────────────────────────────────────────────────────────
function NovenaView({ onBack }) {
  const [selected, setSelected] = useState(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [prayedDays, setPrayedDays] = useState(new Set());

  if (selected) {
    const novena = NOVENAS.find(n=>n.id===selected);
    const day = novena.days[currentDay];
    const hasCompleted = prayedDays.has(`${selected}-${currentDay}`);

    return (
      <div>
        {/* Back */}
        <button onClick={()=>setSelected(null)} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:12,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0}}>
          <ChevIco dir="left"/> Back to Novenas
        </button>

        {/* Header */}
        <div style={{background:novena.color,border:`1px solid ${novena.border}`,borderRadius:18,padding:20,marginBottom:14}}>
          <div style={{fontSize:9,color:novena.accent||GOLD_BRIGHT,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:6}}>Novena</div>
          <div style={{fontFamily:CINZEL,fontSize:16,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:4}}>{novena.title}</div>
          <div style={{fontSize:11,color:novena.accent||GOLD_BRIGHT,fontFamily:CINZEL,letterSpacing:"0.08em",marginBottom:12}}>{novena.subtitle}</div>
          <p style={{fontSize:12,color:CREAM,lineHeight:1.78,fontFamily:"'Lato',sans-serif"}}>{novena.description}</p>
        </div>

        {/* Day selector */}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {novena.days.map((_,i)=>{
            const done=prayedDays.has(`${selected}-${i}`);
            const active=currentDay===i;
            return(
              <button key={i} onClick={()=>setCurrentDay(i)} style={{width:36,height:36,borderRadius:"50%",background:active?GOLD:done?"#182818":CARD,border:`1.5px solid ${active?GOLD:done?"#3A9A4A":BORDER}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:active?"#1A1000":done?"#2A8030":MUTED,fontSize:11,fontFamily:CINZEL,fontWeight:active?700:400,transition:"all 0.15s"}}>
                {done&&!active?"✓":i+1}
              </button>
            );
          })}
        </div>

        {/* Day card */}
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{fontSize:9,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:6}}>Day {currentDay+1}</div>
          <div style={{fontFamily:CINZEL,fontSize:14,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:4}}>Intention</div>
          <div style={{fontSize:12,color:GOLD,fontFamily:CINZEL,letterSpacing:"0.06em",marginBottom:16}}>{day.intention}</div>
          <div style={{borderTop:`1px solid ${BORDER}`,paddingTop:16}}>
            <div style={{fontSize:9,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:10}}>Prayer</div>
            <div style={{fontFamily:CINZEL,fontSize:11,color:CREAM,lineHeight:2.1,letterSpacing:"0.04em",fontWeight:400,textShadow:EMBOSS,whiteSpace:"pre-line"}}>{day.prayer}</div>
          </div>
        </div>

        {/* Mark prayed */}
        <button onClick={()=>setPrayedDays(p=>{const s=new Set(p);hasCompleted?s.delete(`${selected}-${currentDay}`):s.add(`${selected}-${currentDay}`);return s;})}
          style={{width:"100%",background:hasCompleted?"#0A1A0A":"#181408",border:`1px solid ${hasCompleted?"#3A9A4A":GOLD+"40"}`,borderRadius:14,padding:"13px",color:hasCompleted?"#2A7A30":GOLD_BRIGHT,fontSize:12,fontFamily:CINZEL,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",textShadow:hasCompleted?"none":EMBOSS,marginBottom:10}}>
          {hasCompleted?"✓  Prayed Today":"Mark as Prayed"}
        </button>

        {/* Navigate days */}
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{if(currentDay>0)setCurrentDay(currentDay-1);}} disabled={currentDay===0} style={{flex:1,background:CARD,border:`1px solid ${currentDay===0?BORDER:GOLD+"40"}`,borderRadius:12,padding:"12px 0",cursor:currentDay===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:currentDay===0?.35:1}}>
            <ChevIco dir="left"/><span style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif"}}>Previous</span>
          </button>
          <button onClick={()=>{if(currentDay<8)setCurrentDay(currentDay+1);}} disabled={currentDay===8} style={{flex:1,background:currentDay===8?CARD:SURFACE,border:`1px solid ${currentDay===8?BORDER:GOLD+"55"}`,borderRadius:12,padding:"12px 0",cursor:currentDay===8?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:currentDay===8?.35:1}}>
            <span style={{fontSize:12,color:currentDay===8?MUTED:GOLD_BRIGHT,fontFamily:"'Lato',sans-serif"}}>{currentDay===8?"Complete":"Next Day"}</span>{currentDay<8&&<ChevIco/>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:12,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0}}>
        <ChevIco dir="left"/> Back to Prayers
      </button>
      <div style={{fontFamily:CINZEL,fontSize:16,color:WHITE,fontWeight:600,letterSpacing:"0.07em",marginBottom:4,textShadow:EMBOSS}}>Novenas</div>
      <p style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif",marginBottom:18,lineHeight:1.7}}>A novena is nine days of prayer offered for a particular intention, trusting in God's grace. Select a novena to begin.</p>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {NOVENAS.map(n=>(
          <button key={n.id} onClick={()=>{setSelected(n.id);setCurrentDay(0);}} style={{background:n.color,border:`1px solid ${n.border}`,borderRadius:16,padding:18,cursor:"pointer",textAlign:"left",width:"100%",transition:"border-color 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:CINZEL,fontSize:14,color:WHITE,fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:3}}>{n.title}</div>
                <div style={{fontSize:11,color:n.accent||GOLD_BRIGHT,fontFamily:CINZEL,letterSpacing:"0.08em",marginBottom:10}}>{n.subtitle}</div>
                <p style={{fontSize:11,color:"#A0988A",lineHeight:1.7,fontFamily:"'Lato',sans-serif"}}>{n.description.substring(0,110)}...</p>
              </div>
              <ChevIco/>
            </div>
            <div style={{marginTop:12,display:"flex",gap:5}}>
              {Array.from({length:9},(_,i)=>(
                <div key={i} style={{width:18,height:4,borderRadius:2,background:prayedDays.has(`${n.id}-${i}`)?"#2A8030":"rgba(255,255,255,0.1)"}}/>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── THREE O'CLOCK PRAYER VIEW ───────────────────────────────────────────────
function ThreeOClockView({ onBack }) {
  const [showChaplet, setShowChaplet] = useState(false);
  return (
    <div>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:MUTED,fontSize:12,cursor:"pointer",fontFamily:"'Lato',sans-serif",marginBottom:16,padding:0}}>
        <ChevIco dir="left"/> Back to Prayers
      </button>

      {/* Header */}
      <div style={{background:"#F5EEF8",border:"1px solid #9B59C0",borderRadius:20,padding:22,marginBottom:14,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(155,89,192,0.04)"}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
          <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🕒</div>
          <div>
            <div style={{fontFamily:CINZEL,fontSize:16,color:"#4A2070",fontWeight:600,letterSpacing:"0.07em",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.title}</div>
            <div style={{fontSize:10,color:"#7040A0",letterSpacing:"0.18em",fontFamily:CINZEL,textTransform:"uppercase"}}>{THREE_OCLOCK_PRAYER.subtitle}</div>
          </div>
        </div>
        <div style={{background:"rgba(155,89,192,0.06)",borderRadius:12,padding:14,borderLeft:"3px solid rgba(155,89,192,0.4)"}}>
          <div style={{fontSize:9,color:"#7040A0",letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:8}}>Jesus to Saint Faustina</div>
          <p style={{fontSize:11,color:"#4A2870",lineHeight:1.9,fontFamily:CINZEL,fontStyle:"italic",letterSpacing:"0.03em",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.instruction}</p>
        </div>
      </div>

      {/* Short Prayer */}
      <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12}}>
        <div style={{fontSize:9,color:GOLD,letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:12}}>Prayer for the Hour of Mercy</div>
        <div style={{fontFamily:CINZEL,fontSize:12,color:CREAM,lineHeight:2.1,letterSpacing:"0.04em",fontWeight:400,textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.shortPrayer}</div>
      </div>

      {/* Chaplet toggle */}
      <button onClick={()=>setShowChaplet(!showChaplet)} style={{width:"100%",background:showChaplet?"#0A1A0A":"#181408",border:`1px solid ${showChaplet?"#3A9A4A":GOLD+"40"}`,borderRadius:14,padding:"13px",color:showChaplet?"#2A7A30":GOLD_BRIGHT,fontSize:12,fontFamily:CINZEL,fontWeight:600,letterSpacing:"0.08em",cursor:"pointer",textShadow:showChaplet?"none":EMBOSS,marginBottom:12}}>
        {showChaplet?"✕  Hide Chaplet":"📿  Full Divine Mercy Chaplet"}
      </button>

      {showChaplet&&(
        <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:20,marginBottom:12}}>
          <div style={{fontFamily:CINZEL,fontSize:11,color:CREAM,lineHeight:2.2,letterSpacing:"0.04em",whiteSpace:"pre-line",textShadow:EMBOSS}}>{THREE_OCLOCK_PRAYER.chaplet}</div>
        </div>
      )}

      {/* CCC note */}
      <div style={{background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:14,padding:16}}>
        <div style={{fontSize:9,color:GOLD,letterSpacing:"0.18em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:8}}>Catechism of the Catholic Church</div>
        <p style={{fontSize:12,color:"#908878",lineHeight:1.78,fontFamily:"'Lato',sans-serif"}}>{THREE_OCLOCK_PRAYER.ccc}</p>
      </div>
    </div>
  );
}

// ─── PRAYERS TAB ─────────────────────────────────────────────────────────────
function PrayersTab() {
  const [section,setSection]=useState("prayers");
  const [subSection,setSubSection]=useState(null); // "novenas" | "three-oclock" | null
  const [expandedPrayer,setExpandedPrayer]=useState(null);
  const [mysteryType,setMysteryType]=useState("Joyful");
  const [decade,setDecade]=useState(0);
  const [beads,setBeads]=useState(0);

  const PRAYERS=[
    {t:"Our Father",s:"The Lord's Prayer",text:"Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",note:"Taught by Jesus himself in Matthew 6:9–13, this is the foundational prayer of the Christian faith. The Catechism of the Catholic Church calls it 'the summary of the whole gospel' (CCC 2761)."},
    {t:"Hail Mary",s:"Ave Maria",text:"Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",note:"Drawn from Luke 1:28 and 1:42, this is the most beloved Marian prayer in the Catholic tradition. The CCC affirms that Mary's intercession flows from her divine motherhood (CCC 969)."},
    {t:"Glory Be",s:"Doxology",text:"Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",note:"A short trinitarian doxology prayed at the end of each decade of the Rosary. The CCC teaches that doxology is 'the form of prayer which sings God's glory' (CCC 2589)."},
    {t:"Act of Contrition",s:"Prayer of Repentance",text:"O my God, I am heartily sorry for having offended Thee, and I detest all my sins because I dread the loss of heaven and the pains of hell, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to confess my sins, to do penance, and to amend my life. Amen.",note:"Traditionally prayed before Confession and as a regular examination of conscience. The CCC teaches that contrition is 'the most important act of the penitent' (CCC 1451)."},
    {t:"The Angelus",s:"Marian Devotion",text:"The Angel of the Lord declared unto Mary, and she conceived of the Holy Spirit. Hail Mary…\n\nBehold the handmaid of the Lord. Be it done unto me according to Thy word. Hail Mary…\n\nAnd the Word was made flesh, and dwelt among us. Hail Mary…\n\nPray for us, O Holy Mother of God, that we may be made worthy of the promises of Christ.",note:"Traditionally prayed three times a day (6am, noon, 6pm) at the ringing of the church bell. It commemorates the Annunciation and the Incarnation, which the CCC calls 'the heart of the Good News' (CCC 422)."},
  ];

  const myst=ROSARY[mysteryType];
  const curDecade=myst.decades[decade];
  const MYSTERY_TYPES=["Joyful","Sorrowful","Glorious","Luminous"];

  // Sub-section views
  if (subSection === "novenas") return <div style={{padding:"0 20px 20px"}}><NovenaView onBack={()=>setSubSection(null)}/></div>;
  if (subSection === "three-oclock") return <div style={{padding:"0 20px 20px"}}><ThreeOClockView onBack={()=>setSubSection(null)}/></div>;

  return (
    <div style={{padding:"0 20px 20px"}}>
      <div style={{padding:"24px 0 16px"}}>
        <div style={{fontFamily:CINZEL,fontSize:17,color:WHITE,marginBottom:3,letterSpacing:"0.07em",fontWeight:600,textShadow:EMBOSS}}>
          {section==="prayers"?"Catholic Prayers":"The Holy Rosary"}
        </div>
        <div style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif"}}>
          {section==="prayers"?"Traditional prayers of the faith":"A decade-by-decade guide"}
        </div>
      </div>

      {/* Tab toggle */}
      <div style={{display:"flex",background:SURFACE,borderRadius:12,padding:3,marginBottom:18,border:`1px solid ${BORDER}`}}>
        {[{id:"prayers",label:"🙏  Prayers"},{id:"rosary",label:"📿  Rosary"}].map(t=>(
          <button key={t.id} onClick={()=>setSection(t.id)} style={{flex:1,background:section===t.id?CARD:"none",border:section===t.id?`1px solid ${GOLD}40`:"1px solid transparent",borderRadius:10,padding:"8px 0",color:section===t.id?GOLD_BRIGHT:MUTED,fontSize:12,cursor:"pointer",fontFamily:"'Lato',sans-serif",transition:"all 0.2s"}}>{t.label}</button>
        ))}
      </div>

      {/* ── PRAYERS LIST ── */}
      {section==="prayers"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%"}}>

          <button onClick={()=>setSubSection("three-oclock")} style={{background:"#F5EEF8",border:"1px solid #9B59C0",borderRadius:16,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.35)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🕒</div>
                <div>
                  <div style={{fontFamily:CINZEL,fontSize:14,color:"#4A2070",fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:2}}>Three O'Clock Prayer</div>
                  <div style={{fontSize:10,color:"#7040A0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:CINZEL}}>Hour of Mercy · Divine Mercy Chaplet</div>
                </div>
              </div>
              <ChevIco/>
            </div>
            {isThreeOClockHour()&&(
              <div style={{marginTop:10,background:"rgba(155,89,192,0.12)",border:"1px solid rgba(155,89,192,0.25)",borderRadius:8,padding:"6px 12px",display:"inline-block"}}>
                <span style={{fontSize:10,color:"#7040A0",fontFamily:CINZEL,letterSpacing:"0.08em"}}>🕒 It is the Hour of Mercy now</span>
              </div>
            )}
          </button>

          {/* Novenas — entry card */}
          <button onClick={()=>setSubSection("novenas")} style={{background:"#F0EAF8",border:`1px solid #8060C0`,borderRadius:16,padding:18,cursor:"pointer",textAlign:"left",width:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(100,60,180,0.12)",border:"1px solid rgba(100,60,180,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🕯</div>
                <div>
                  <div style={{fontFamily:CINZEL,fontSize:14,color:"#3A1860",fontWeight:600,letterSpacing:"0.06em",textShadow:EMBOSS,marginBottom:2}}>Novenas</div>
                  <div style={{fontSize:10,color:"#6040A0",letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:CINZEL}}>Nine Days of Prayer · 4 Novenas</div>
                </div>
              </div>
              <ChevIco/>
            </div>
          </button>

          {/* Traditional prayers */}
          {PRAYERS.map((p,i)=>(
            <div key={i} onClick={()=>setExpandedPrayer(expandedPrayer===i?null:i)} style={{background:CARD,border:`1px solid ${expandedPrayer===i?GOLD+"50":BORDER}`,borderRadius:16,padding:20,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:CINZEL,fontSize:14,color:WHITE,marginBottom:3,letterSpacing:"0.06em",fontWeight:600,textShadow:EMBOSS}}>{p.t}</div>
                  <div style={{fontSize:10,color:GOLD,letterSpacing:"0.12em",textTransform:"uppercase",fontFamily:CINZEL}}>{p.s}</div>
                </div>
                <span style={{color:MUTED,fontSize:12}}>{expandedPrayer===i?"▲":"▼"}</span>
              </div>
              {expandedPrayer===i&&(
                <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
                  <div style={{fontFamily:CINZEL,fontSize:11,color:CREAM,lineHeight:2.1,marginBottom:14,letterSpacing:"0.04em",fontWeight:400,whiteSpace:"pre-line",textShadow:EMBOSS}}>{p.text}</div>
                  <div style={{background:SURFACE,borderLeft:`3px solid ${GOLD}`,borderRadius:"0 8px 8px 0",padding:"10px 14px"}}>
                    <div style={{fontSize:9,color:GOLD,letterSpacing:"0.16em",textTransform:"uppercase",fontFamily:CINZEL,marginBottom:5}}>Note & CCC</div>
                    <p style={{fontSize:11,color:MUTED,lineHeight:1.75,fontFamily:"'Lato',sans-serif"}}>{p.note}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ROSARY GUIDE ── */}
      {section==="rosary"&&(
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {MYSTERY_TYPES.map(t=>{
              const m=ROSARY[t];const on=mysteryType===t;
              return(
                <button key={t} onClick={()=>{setMysteryType(t);setDecade(0);setBeads(0);}} style={{background:on?m.color:CARD,border:`1px solid ${on?m.border:BORDER}`,borderRadius:12,padding:"13px 12px",cursor:"pointer",transition:"all 0.2s",textAlign:"left"}}>
                  <div style={{fontFamily:CINZEL,fontSize:12,color:on?WHITE:MUTED,fontWeight:on?600:400,letterSpacing:"0.05em",marginBottom:2,textShadow:on?EMBOSS:"none"}}>{t}</div>
                  <div style={{fontSize:9,color:on?"rgba(255,255,255,0.55)":MUTED,fontFamily:"'Lato',sans-serif"}}>{m.day}</div>
                </button>
              );
            })}
          </div>

          <div style={{background:myst.color,border:`1px solid ${myst.border}`,borderRadius:20,padding:22,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.45)",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:CINZEL}}>Decade {decade+1} of 5</div>
              <div style={{display:"flex",gap:7}}>
                {myst.decades.map((_,i)=>(
                  <div key={i} onClick={()=>{setDecade(i);setBeads(0);}} style={{width:6,height:6,borderRadius:"50%",background:i===decade?GOLD_BRIGHT:"rgba(255,255,255,0.2)",cursor:"pointer",transition:"background 0.2s"}}/>
                ))}
              </div>
            </div>
            <div style={{fontFamily:CINZEL,fontSize:15,color:WHITE,fontWeight:600,letterSpacing:"0.06em",marginBottom:4,textShadow:EMBOSS}}>{curDecade.name}</div>
            <div style={{fontSize:10,color:GOLD,marginBottom:14,fontFamily:CINZEL,letterSpacing:"0.12em",fontWeight:700}}>{curDecade.ref}</div>
            <p style={{fontSize:12,color:CREAM,lineHeight:1.85,fontFamily:"'Lato',sans-serif"}}>{curDecade.med}</p>
          </div>

          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:16,padding:18,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontSize:10,color:MUTED,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:CINZEL}}>Hail Mary</div>
              <div style={{fontFamily:CINZEL,fontSize:12,color:beads===10?GOLD:MUTED,fontWeight:600,textShadow:beads===10?EMBOSS:"none"}}>{beads}/10</div>
            </div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap",justifyContent:"center",marginBottom:beads===10?12:0}}>
              {Array.from({length:10},(_,i)=>(
                <div key={i} onClick={()=>setBeads(beads===i+1?i:i+1)} style={{width:30,height:30,borderRadius:"50%",background:i<beads?GOLD:SURFACE,border:`1.5px solid ${i<beads?GOLD_BRIGHT:BORDER}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s",fontSize:9,color:i<beads?"#FFFFFF":MUTED,fontWeight:700,fontFamily:CINZEL}}>
                  {i+1}
                </div>
              ))}
            </div>
            {beads===10&&<div style={{textAlign:"center",paddingTop:4}}><div style={{fontSize:11,color:GOLD,fontFamily:CINZEL,letterSpacing:"0.08em",textShadow:EMBOSS}}>Glory be to the Father, and to the Son, and to the Holy Spirit.</div></div>}
          </div>

          <div style={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:14,padding:15,marginBottom:14}}>
            <div style={{fontSize:9,color:MUTED,letterSpacing:"0.16em",textTransform:"uppercase",marginBottom:8,fontFamily:CINZEL}}>Before Each Decade</div>
            <div style={{fontFamily:CINZEL,fontSize:10,color:MUTED,lineHeight:1.95,letterSpacing:"0.04em",textShadow:EMBOSS}}>Our Father, who art in heaven, hallowed be Thy name...</div>
          </div>

          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{if(decade>0){setDecade(decade-1);setBeads(0);}}} disabled={decade===0} style={{flex:1,background:CARD,border:`1px solid ${decade===0?BORDER:GOLD+"40"}`,borderRadius:12,padding:"12px 0",cursor:decade===0?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:decade===0?.35:1,transition:"opacity 0.2s"}}>
              <ChevIco dir="left"/><span style={{fontSize:12,color:MUTED,fontFamily:"'Lato',sans-serif"}}>Previous</span>
            </button>
            <button onClick={()=>{if(decade<4){setDecade(decade+1);setBeads(0);}}} disabled={decade===4} style={{flex:1,background:decade===4?CARD:SURFACE,border:`1px solid ${decade===4?BORDER:GOLD+"55"}`,borderRadius:12,padding:"12px 0",cursor:decade===4?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,opacity:decade===4?.35:1,transition:"opacity 0.2s"}}>
              <span style={{fontSize:12,color:decade===4?MUTED:GOLD_BRIGHT,fontFamily:"'Lato',sans-serif"}}>{decade===4?"Complete":"Next Decade"}</span>{decade<4&&<ChevIco/>}
            </button>
          </div>

          {decade===4&&beads===10&&(
            <div style={{background:"#E8F5EA",border:`1px solid #4A9A5A50`,borderRadius:16,padding:20,marginTop:14,textAlign:"center"}}>
              <div style={{fontFamily:CINZEL,fontSize:14,color:WHITE,fontWeight:600,letterSpacing:"0.08em",marginBottom:8,textShadow:EMBOSS}}>Mystery Complete</div>
              <p style={{fontSize:12,color:"#2A7A30",lineHeight:1.75,fontFamily:"'Lato',sans-serif"}}>You have completed the {mysteryType} Mysteries. May Our Lady carry your intentions before the throne of God. Amen.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function BibleApp() {
  const [tab,setTab]=useState("home");
  const [favorites,setFavorites]=useState(new Set());

  const onFav=(id)=>setFavorites(prev=>{const next=new Set(prev);next.has(id)?next.delete(id):next.add(id);return next;});

  const TABS=[
    {id:"home",label:"Home",I:HomeIco},
    {id:"soul",label:"Soul Check",I:ChatIco},
    {id:"explore",label:"Explore",I:BookIco},
    {id:"prayers",label:"Prayers",I:PrayIco},
  ];

  return (
    <div style={{background:DARK,minHeight:"100vh",width:"100%",fontFamily:"'Lato',-apple-system,sans-serif",color:WHITE,position:"relative"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Lato:wght@300;400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:0}
        textarea::placeholder{color:#B0A090}
        input::placeholder{color:#B0A090}
        input[type=number]{-moz-appearance:textfield;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        button{font-family:'Lato',-apple-system,sans-serif}
        p{margin:0}
        select option{background:#FFFDF8;color:#2E1F0E}
      `}</style>

      <div style={{overflowY:"auto",paddingBottom:84}}>
        {tab==="home"    && <HomeTab favorites={favorites} onFav={onFav}/>}
        {tab==="soul"    && <SoulCheckTab/>}
        {tab==="explore" && <ExploreTab favorites={favorites} onFav={onFav}/>}
        {tab==="prayers" && <PrayersTab/>}
      </div>

      {/* Bottom nav */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(245,239,228,0.96)",backdropFilter:"blur(14px)",borderTop:`1px solid ${BORDER}`,display:"flex",padding:"8px 0 12px",boxShadow:"0 -2px 12px rgba(0,0,0,0.07)"}}>
        {TABS.map(({id,label,I})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"4px 0",position:"relative"}}>
            {id==="explore"&&favorites.size>0&&(
              <div style={{position:"absolute",top:0,right:"calc(50% - 20px)",width:15,height:15,borderRadius:"50%",background:GOLD,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#FFFFFF",fontWeight:700}}>
                {favorites.size}
              </div>
            )}
            <I on={tab===id}/>
            <span style={{fontSize:9,color:tab===id?GOLD:MUTED,letterSpacing:"0.05em",fontWeight:tab===id?700:400}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}