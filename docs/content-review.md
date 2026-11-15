# Content validation report

What was checked against published sources in November 2026, what was corrected, and the
few items that still need a person's decision.

## Summary

| Area | Checked against | Result |
|---|---|---|
| Scripture wording (86 verses) | New American Bible, Revised Edition (BibleGateway NABRE text; the 35 newest also against the USCCB site) | 19 older verses corrected; all 86 now match. A test (`src/verses.test.js`) fails if any verse drifts from the NABRE text on file |
| Psalm verse numbers | Same | 3 Psalms and Tobit now show the NABRE number |
| Catechism citations (52) | The Vatican's Catechism text (vatican.va) | 41 reworded or renumbered so each says what its paragraph says; 11 were already right |
| Saints' Scripture quotes | NABRE | 7 corrected |
| Calendar | General Roman Calendar (for users mainly in the UAE) | 2 dates changed, 1 title corrected |
| Prayers | USCCB (Angelus) | Angelus completed; a mislabelled "chaplet" renamed |

## 1. Scripture wording: corrected

These did not match the NABRE and now do. References were not changed (shared links and
saved verses depend on them).

Psalm 23:1, Jeremiah 29:11, Isaiah 40:31, 1 Corinthians 13:4-5, Romans 8:38-39, Isaiah 41:10,
Psalm 121:1-2, Psalm 27:1, Zephaniah 3:17, Sirach 2:6, Ephesians 2:10, Psalm 103:8,
Psalm 16:8, 2 Maccabees 12:46, Tobit 4:15, Isaiah 55:8-9, Deuteronomy 31:6, James 1:17,
Sirach 3:17.

Notable changes a reader will see: Psalm 23:1 now reads "there is nothing I lack";
2 Maccabees 12:46 now reads "Thus he made atonement for the dead that they might be
absolved from their sin" (the older wording was from a different translation).

Verse numbers: the NABRE numbers these one verse later. The app now shows the NABRE number,
while old links keep working.

| Stored reference | Now shown as |
|---|---|
| Psalm 46:10 | Psalm 46:11 |
| Psalm 34:18 | Psalm 34:19 |
| Psalm 62:1-2 | Psalm 62:2-3 |
| Tobit 4:15 | Tobit 4:15-16 (two sentences joined with "…") |

Partial quotations: many entries quote part of a verse (for example without "Jesus said to
her," or a closing clause). Every quoted part is exact NABRE wording. "LORD" is written
"Lord", and the brackets the NABRE puts around a supplied word are kept.

## 2. Catechism citations: corrected

Each citation was compared with the paragraph it names. Where the sentence in the app
claimed something the paragraph does not say, the sentence was rewritten to say what the
paragraph says, or the number was changed to the paragraph that supports the claim.

Numbers changed: St Casimir 2105 → 2013; St George 2506 → 2473; Transfiguration 555 → 556;
Nativity of Mary 490 → 488; Archangels 331 → 328, 331; St Francis of Assisi 2402 → 344, 2416;
All Souls 1030 → 1030, 1032; Christmas 458 → 458-460; Glory Be 2589 → 2639;
The Angelus 422 → 484.

Reworded to match the paragraph (number kept): Solemnity of Mary (495), Baptism of the
Lord (536), Thomas Aquinas (159), Presentation (529), Patrick (849), Joseph (1014),
Annunciation (484), John Paul II on 2 April (1956), Catherine of Siena (798), Joseph the
Worker (2427), Visitation (717), Uganda Martyrs (2473), Anthony of Padua (2033), John the
Baptist (523), Peter and Paul (861), Benedict (916), Mary Magdalene (641), James (857),
Ignatius (914), Teresa Benedicta (2473), Augustine (400), Holy Cross (618), Thérèse (826),
Our Lady of the Rosary (971), Teresa of Avila (2697), Cecilia (1156), Francis Xavier (849),
Immaculate Conception (492), John the Apostle (101), Hail Mary (969), Act of Contrition (1451).

Already correct: Epiphany (528), Lourdes, Fatima and Guadalupe (67), Chair of Peter (882),
Martin I and Stephen (2473), Assumption (966), All Saints (2013), Our Father (2761),
Three O'Clock Hour (2744).

## 3. Saints' quotes

Corrected to NABRE wording, because they are Scripture:

| Saint | Now reads | Source |
|---|---|---|
| Paul | "I have the strength for everything through him who empowers me." | Philippians 4:13 |
| Peter | "Lord, you know everything; you know that I love you." | John 21:17 |
| John the Apostle | "God is love, and whoever remains in love remains in God and God in him." | 1 John 4:16 |
| Stephen | "Behold, I see the heavens opened and the Son of Man standing at the right hand of God." | Acts 7:56 |
| Henry | "Not to us, Lord, not to us but to your name give glory." | Psalm 115:1 |
| Joseph | "He did as the angel of the Lord had commanded him." | Matthew 1:24 (about him; Scripture records no words of his) |
| Mary Magdalene | "I have seen the Lord." | John 20:18 (replaces a line that was a description, not her words) |

**Still needs a decision.** These are popular attributions that could not be confirmed from
the saints' own writings. They were left unchanged. Either keep them as traditional
attributions or replace them with the suggestion.

| Saint | In the app | Concern | Suggestion |
|---|---|---|---|
| Francis of Assisi | "Start by doing what is necessary, then what is possible…" | No known source in his writings | A line from his Canticle of the Creatures |
| Thomas Aquinas | "To one who has faith, no explanation is necessary." | Attribution uncertain | His remark that all he had written seemed like straw (already in his bio) |
| Francis Xavier | "Give me the grace, O Lord, to labor, to suffer, and not to count the cost." | Echoes the Prayer for Generosity attributed to St Ignatius | A line from his letters |
| Catherine of Siena | "Be who God meant you to be and you will set the world on fire." | A popular paraphrase of a line in her letters | Keep, or use the letter's own wording |
| Ignatius of Loyola | "Go forth and set the world on fire." | Traditional; not in his writings | Keep as traditional |
| Lawrence, Camillus, Bonaventure, Clare, Anthony | various | Traditional or paraphrased | Keep unless a reviewer objects |

## 4. Calendar (users mainly in the UAE)

The app follows the General Roman Calendar, which is the right base for the UAE.

| Change | Before | Now |
|---|---|---|
| Saint Camillus de Lellis | 18 July (United States date) | 14 July (general calendar) |
| Saint Kateri Tekakwitha | 14 July (United States date) | 17 April (the date used outside the United States); shown when that day is a weekday |
| 2 April entry | "Memorial of Saint John Paul II" | "Death of Saint John Paul II" (his memorial is 22 October, which has its own entry) |

**Still needs a decision.**
- The Apostolic Vicariate of Southern Arabia has its own celebrations (for example Our Lady
  of Arabia, its patroness). These are not in the app. A local priest can supply the dates
  and they can be added.
- Epiphany follows the Sunday celebration. If parishes in the UAE keep it on 6 January, say
  so and it can be fixed to that date.
- Saint Faustina (5 October) is shown on weekdays only.

## 5. Prayers

| Item | What was done |
|---|---|
| The Angelus | The closing prayer ("Pour forth, we beseech Thee, O Lord…") was missing and has been added, checked against the USCCB text and set in the traditional wording the rest of the app uses |
| "Divine Mercy Chaplet" button | The text under it is the Three O'Clock prayers, not the Chaplet. Renamed "More prayers for this hour" / "Three O'Clock Prayers" |
| Three O'Clock quotation | The repeated "— Jesus to Saint Faustina" at the end was removed (the label above says it) |

**Still needs a decision.**
- The full Divine Mercy Chaplet and a full Rosary guide (Creed, Our Father, Glory Be, Fatima
  Prayer, Hail Holy Queen) are not in the app. Both are good candidates for a later round.
- The Divine Mercy novena prayers for days 2 to 9 are shorter than those in St Faustina's
  Diary, and the other three novenas are original compositions in a traditional style. A
  priest should confirm they are suitable, or supply the customary texts.
