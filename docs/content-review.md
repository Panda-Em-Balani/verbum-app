# Content review list

For a person you trust with the faith content (a priest, deacon, catechist or careful
reader). Nothing here has been changed in the app: prayer and verse texts are left exactly
as they were, and each item below says what to check and what to do about it.

How to use it: work through one section at a time, mark each row OK or write the correction,
and send the corrections back. Rows marked **Verified** were checked against the source
during the rebuild.

## 1. Scripture wording and translation (most important)

The app credits the New American Bible, Revised Edition (NABRE) in its About section. The 35
verses added in the rebuild (library ids 16 to 50) were copied from the USCCB website's NABRE
text and are **Verified**. The 51 older verses could not be re-checked because the USCCB
site blocks automated reading, and at least two of them do not match the NABRE:

| Verse | In the app | NABRE | Status |
|---|---|---|---|
| Psalm 27:1 (daily verse) | "…whom do I fear?" | "…whom should I fear?" | **Verified** mismatch |
| Psalm 23:1 | "The Lord is my shepherd; I shall not want." | "The LORD is my shepherd; there is nothing I lack." | Believed mismatch (not re-checked) |

What to do: compare each of the older verses (library ids 1 to 15 in `src/verses.js`, and
every entry in `DAILY_VERSES`) with https://bible.usccb.org/bible and correct the `text`.
Do **not** change any `ref`: shared links depend on them.

Some new verses quote part of a verse, leaving out a linking word at the start. Confirm this
is acceptable:

| Ref | Left out |
|---|---|
| James 5:15 | opening "and"; the last sentence of the verse |
| Ephesians 6:10 | opening "Finally," |
| Matthew 5:16 | opening "Just so," |
| Psalm 147:11 | opening "Rather" |
| Matthew 5:44 | the verse continues into 5:45 |
| Ephesians 2:4-5 | closing "(by grace you have been saved)," |
| John 11:25-26 | "Jesus told her," and the closing question "Do you believe this?" |
| John 11:40 | "Jesus said to her," |
| Psalm 30:6 | the first half of the verse |
| Psalm 30:12 | verse 13 not included |
| Isaiah 53:4 | the second half of the verse |
| Micah 7:18 | the sentence continues into verse 19 |
| "LORD" | written "Lord" throughout, matching the older entries |

## 2. Verse numbering

The NABRE numbers some Psalms one verse later than many other Bibles.

| In the app | NABRE number | Note |
|---|---|---|
| Psalm 46:10 "Be still and know that I am God!" | Psalm 46:11 | **Verified** on the USCCB page |
| Psalm 34:18 "The Lord is close to the brokenhearted…" | Psalm 34:19 | Believed; not re-checked |
| Psalm 62:1-2, Psalm 91:1-2, Psalm 121:1-2, Psalm 16:8, Psalm 103:8, Psalm 118:24, Psalm 139:14 | check each | Not re-checked |

What to do: the stored `ref` must stay (links). If you want the correct number shown, say so
and a separate display label can be added.

## 3. Calendar dates

The app now follows the General Roman Calendar. These entries are kept on other dates:

| Entry | App date | General calendar | What happens now |
|---|---|---|---|
| Saint Camillus de Lellis | 18 July (United States date) | 14 July | Shown on 18 July when that day is a weekday |
| Saint Kateri Tekakwitha | 14 July (United States) | not in the general calendar | Shown on 14 July in place of Camillus |
| Saint Faustina Kowalska | 5 October | not in the general calendar (optional memorial since 2020) | Shown on 5 October when it is a weekday |
| "Memorial of Saint John Paul II" on 2 April | 2 April (anniversary of his death) | his memorial is 22 October | Shown on 2 April on weekdays; consider retitling "Death of Saint John Paul II" |
| The Epiphany | follows the Sunday celebration | 6 January where not transferred | Decide which your users expect |
| Saint Henry | 13 July | 13 July | Fine; the app's bio describes Emperor Henry II, which is the saint of this day |

If most users are in one country, say which, and the national calendar can be used instead.

## 4. Quote attributions

| Saint | Quote in the app | Concern |
|---|---|---|
| Francis of Assisi | "Start by doing what is necessary, then what is possible…" | Widely attributed; no known source in his writings |
| Catherine of Siena | "Be who God meant you to be and you will set the world on fire." | A popular paraphrase of a line from her letters |
| Ignatius of Loyola | "Go forth and set the world on fire." | Traditional attribution; not found in his writings |
| Paul the Apostle | "I can do all things through Christ who strengthens me." | Not the NABRE wording of Philippians 4:13 (the app's own verse 3 has the NABRE wording) |
| Mary Magdalene | "She stood outside the tomb weeping — and then she saw Him." | A description, not something she said |
| Joseph | "He did as the angel of the Lord commanded him." | Scripture about him (Matthew 1:24), not his words |
| Peter, John, Stephen, Blessed Virgin Mary | Scripture quotations | Check wording against the NABRE |
| Thomas Aquinas | "To one who has faith, no explanation is necessary." | Attribution uncertain |
| Anthony of Padua | "Actions speak louder than words; let your actions speak." | Paraphrase of a sermon line |

## 5. Shortened or adapted prayers

| Item | Where | Note |
|---|---|---|
| Divine Mercy novena, days 2 to 9 | `src/content/novenas.js` | Much shorter than the prayers in St. Faustina's Diary; day 1 is close to complete |
| Novenas to Our Lady of Guadalupe, the Sacred Heart and St. Joseph | `src/content/novenas.js` | Original compositions in a traditional style, not the customary texts |
| "Divine Mercy Chaplet" on the Three O'Clock screen | `src/content/threeOclock.js` | These are the Three O'Clock prayers and closing lines, not the full chaplet (no opening prayers, decades or "Holy God"). Either add the full chaplet or rename the button |
| The Angelus | `src/content/prayers.js` | Missing the closing prayer "Pour forth, we beseech Thee…" |
| Three O'Clock quotation | `src/content/threeOclock.js` | The text ends with "— Jesus to Saint Faustina", repeating the label above it |
| Rosary guide | Rosary screen | Covers the decades only; no Creed, Our Father, Glory Be, Fatima Prayer or Hail Holy Queen |

## 6. Catechism citations

Every Catechism (CCC) reference in the app, with the claim it supports. Check each number
against the Catechism; several look loose (for example CCC 2105 for St. Casimir, CCC 1014
for St. Joseph, CCC 2506 for the martyrs).

| Where | Entry | CCC | Claim made in the app |
|---|---|---|---|
| `content/happenings.js:5` | Solemnity of Mary | 495 | The Catechism teaches that Mary's divine motherhood is the reason for all her other privileges (CCC 495). |
| `content/happenings.js:6` | The Epiphany of the Lord | 528 | The CCC presents the Epiphany as the manifestation of Jesus as Messiah of Israel, Son of God, and Savior of the world (CCC 528). |
| `content/happenings.js:7` | Baptism of the Lord | 536 | The CCC teaches that Jesus' baptism is a prefiguring of our own, and that He sanctifies the waters for all Christian baptism (CCC 536). |
| `content/happenings.js:8` | Feast of Saint Thomas Aquinas | 159 | The CCC draws extensively on Aquinas, reflecting his teaching that faith and reason are complementary paths to truth (CCC 159). |
| `content/happenings.js:9` | Presentation of the Lord | 529 | The CCC sees the Presentation as a sign of Jesus' complete dedication to the Father and His acceptance of the Cross (CCC 529). |
| `content/happenings.js:10` | Our Lady of Lourdes | 67 | The CCC affirms that private revelations like Lourdes can help us live the faith more fully, though they do not add to the deposit of faith (CCC 67). |
| `content/happenings.js:11` | Chair of Saint Peter | 882 | The CCC teaches that the Bishop of Rome, as successor of Peter, has full, supreme, and universal power over the whole Church (CCC 882). |
| `content/happenings.js:12` | Feast of Saint Casimir | 2105 | The CCC teaches that the call to holiness is universal and extends to every state of life, including rulers and those in positions of power (CCC 2105). |
| `content/happenings.js:13` | Feast of Saint Patrick | 849 | The CCC highlights the missionary character of the Church, reminding us that every baptized person is called to share the faith as Patrick did (CCC 849). |
| `content/happenings.js:14` | Solemnity of Saint Joseph | 1014 | The CCC honors Joseph as the one entrusted by God with the guardianship of the Holy Family (CCC 1014). |
| `content/happenings.js:15` | The Annunciation of the Lord | 484 | The CCC calls the Annunciation the moment the Eternal Son of God became incarnate in the womb of the Virgin Mary (CCC 484). |
| `content/happenings.js:16` | Memorial of Saint John Paul II | 1956 | His encyclical Veritatis Splendor reaffirmed the CCC's teaching on the objectivity of moral truth (CCC 1956). |
| `content/happenings.js:17` | Memorial of Saint Martin I | 2473 | The CCC affirms that the martyrs give the supreme witness to the truth of the faith (CCC 2473). |
| `content/happenings.js:18` | Feast of Saint George | 2506 | The CCC honors the martyrs as those who by their death gave the most perfect witness to the truth (CCC 2506). |
| `content/happenings.js:19` | Feast of Saint Catherine of Siena | 798 | Her life embodies the CCC's teaching that holiness and prophetic witness are inseparable charisms in the Church (CCC 798). |
| `content/happenings.js:20` | Feast of Saint Joseph the Worker | 2427 | The CCC teaches that work is a participation in the Creator's activity and a means of sanctification (CCC 2427). |
| `content/happenings.js:21` | Our Lady of Fatima | 67 | The CCC teaches that Fatima belongs to the tradition of private revelations that can assist the faithful in living the faith (CCC 67). |
| `content/happenings.js:22` | Visitation of the Blessed Virgin Mary | 717 | The CCC presents the Visitation as a moment when the Holy Spirit fills Elizabeth through Mary's greeting (CCC 717). |
| `content/happenings.js:23` | Feast of the Uganda Martyrs | 2473 | The CCC affirms that martyrdom is the supreme witness to the truth of faith and a participation in the Cross of Christ (CCC 2473). |
| `content/happenings.js:24` | Feast of Saint Anthony of Padua | 2033 | The CCC honors the preaching office as a primary means by which the Gospel is transmitted through the generations (CCC 2033). |
| `content/happenings.js:25` | Birth of Saint John the Baptist | 523 | The CCC teaches that John the Baptist is the greatest of the prophets and the herald who announces Christ's arrival (CCC 523). |
| `content/happenings.js:26` | Solemnity of Saints Peter and Paul | 861 | The CCC teaches that the apostolic succession continues from Peter and Paul through their successors, the bishops (CCC 861). |
| `content/happenings.js:27` | Feast of Saint Benedict | 916 | The CCC honors the monastic life as a special form of participation in the mystery of Christ's prayer and service (CCC 916). |
| `content/happenings.js:28` | Feast of Saint Mary Magdalene | 641 | The CCC affirms that Mary Magdalene represents the primacy of love and personal encounter with the Risen Lord (CCC 641). |
| `content/happenings.js:29` | Feast of Saint James the Apostle | 857 | The CCC honors the apostolic witness as the foundation on which the Church is built (CCC 857). |
| `content/happenings.js:30` | Feast of Saint Ignatius of Loyola | 914 | The CCC affirms that the particular charism of religious institutes like the Jesuits enriches the Church's holiness (CCC 914). |
| `content/happenings.js:31` | Transfiguration of the Lord | 555 | The CCC teaches that the Transfiguration is an anticipation of the resurrection and the glory to which Christ calls His disciples (CCC 555). |
| `content/happenings.js:32` | Feast of Saint Teresa Benedicta of the Cross | 2473 | The CCC teaches that the Church honors those who gave their lives in witness to the faith across every era and culture (CCC 2473). |
| `content/happenings.js:33` | Assumption of the Blessed Virgin Mary | 966 | The CCC teaches that the Assumption is a singular participation in her Son's Resurrection and an anticipation of the resurrection of all Christians (CCC 966). |
| `content/happenings.js:34` | Feast of Saint Augustine of Hippo | 400 | The CCC draws on Augustine extensively, especially regarding grace, original sin, and the nature of the Church (CCC 400). |
| `content/happenings.js:35` | Nativity of the Blessed Virgin Mary | 490 | The CCC honors Mary as chosen before all ages to be the Mother of God, her birth prepared by God's grace (CCC 490). |
| `content/happenings.js:36` | Exaltation of the Holy Cross | 618 | The CCC teaches that the Cross is the unique sacrifice of Christ, the one mediator, which can never be repeated or supplemented (CCC 618). |
| `content/happenings.js:37` | Feast of the Archangels | 331 | The CCC teaches that the existence of angels is a truth of faith, and that they surround Christ and serve in the history of salvation (CCC 331). |
| `content/happenings.js:38` | Feast of Saint Therese of Lisieux | 826 | Her life embodies the CCC's teaching that holiness is for everyone through charity lived in ordinary circumstances (CCC 826). |
| `content/happenings.js:39` | Feast of Saint Francis of Assisi | 2402 | The CCC honors Francis as a model of care for creation, reflecting its teaching on the universal destination of goods (CCC 2402). |
| `content/happenings.js:40` | Our Lady of the Rosary | 971 | The CCC honors the Rosary as an excellent prayer through which we contemplate the mysteries of Christ in union with Mary (CCC 971). |
| `content/happenings.js:41` | Feast of Saint Teresa of Avila | 2697 | The CCC draws on Teresa's mystical teaching, recognizing that prayer is the life of the new heart (CCC 2697). |
| `content/happenings.js:43` | Solemnity of All Saints | 2013 | The CCC teaches that all the faithful are called to holiness and the fullness of Christian life (CCC 2013). |
| `content/happenings.js:44` | All Souls Day — Commemoration of the Faithful Departed | 1030 | The CCC teaches that Purgatory is a final purification of the elect before the beatific vision, and that our prayers assist them (CCC 1030). |
| `content/happenings.js:45` | Feast of Saint Cecilia | 1156 | The CCC affirms that sacred music and song are important means of expressing and deepening faith in the liturgy (CCC 1156). |
| `content/happenings.js:46` | Feast of Saint Francis Xavier | 849 | The CCC teaches that mission is a requirement of the Church's catholicity, a command received from Christ Himself (CCC 849). |
| `content/happenings.js:47` | Immaculate Conception of the Blessed Virgin Mary | 492 | The CCC teaches that Mary was redeemed in a more excellent fashion, preserved from all stain of original sin (CCC 492). |
| `content/happenings.js:48` | Our Lady of Guadalupe | 67 | The CCC affirms that Marian apparitions can serve as signs that help the faithful live the Gospel more fully (CCC 67). |
| `content/happenings.js:49` | Nativity of Our Lord Jesus Christ | 458 | The CCC teaches that the Son of God became man so that we might know God's love, have a model of holiness, and become partakers of the divine nature (CCC 458). |
| `content/happenings.js:50` | Feast of Saint Stephen, First Martyr | 2473 | The CCC honors the martyrs as the supreme witnesses to the truth of the faith (CCC 2473). |
| `content/happenings.js:51` | Feast of Saint John the Apostle | 101 | The CCC affirms that Sacred Scripture, including John's Gospel, is the Word of God expressed in human language (CCC 101). |
| `content/prayers.js:2` | Our Father | 2761 | The CCC calls it 'the summary of the whole gospel' (CCC 2761). |
| `content/prayers.js:3` | Hail Mary | 969 | The CCC affirms that Mary's intercession flows from her divine motherhood (CCC 969). |
| `content/prayers.js:4` | Glory Be | 2589 | A short trinitarian doxology prayed at the end of each decade of the Rosary (CCC 2589). |
| `content/prayers.js:5` | Act of Contrition | 1451 | The CCC teaches that contrition is 'the most important act of the penitent' (CCC 1451). |
| `content/prayers.js:6` | The Angelus | 422 | It commemorates the Annunciation (CCC 422). |
| `content/threeOclock.js:7` |  | 2744 | The Catechism of the Catholic Church teaches that prayer is a vital necessity (CCC 2744). The Three O'Clock Hour is a devotion rooted in the hour of Christ's death on the |
