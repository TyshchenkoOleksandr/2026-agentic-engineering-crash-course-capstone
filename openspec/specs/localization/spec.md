# localization Specification

## Purpose

Shows all interface text in Ukrainian (default) or English, lets the player switch language from the
top-right corner, remembers the choice, and formats numbers according to the selected language.

Scenario tags: `[unit]` = Vitest test in `lib/i18n/i18n.test.ts` (dictionaries, `t`, number
formatting) or `lib/game/preferences.test.ts` (language preference), `[e2e]` = Playwright test in
`e2e/add-foundation.spec.ts`.

## Requirements

### Requirement: Dictionaries with identical keys
There SHALL be exactly two dictionaries, `uk` and `en`, with identical key sets and no empty values.
They SHALL contain exactly these 44 keys with these values (DECISION (confirmed): Stage 2
copy, design D18). The Ukrainian apostrophe is U+2019 (`’`). `{price}` and `{count}` / `{rate}` are
interpolated already formatted with `formatNumber`.

| Key | uk | en |
|---|---|---|
| `mainButton.label` | `Клік` | `Click` |
| `balance.ariaLabel` | `Баланс: {value}` | `Balance: {value}` |
| `theme.switchToDark` | `Увімкнути темну тему` | `Switch to dark theme` |
| `theme.switchToLight` | `Увімкнути світлу тему` | `Switch to light theme` |
| `language.short` | `УКР` | `ENG` |
| `language.switch` | `Змінити мову на англійську` | `Switch language to Ukrainian` |
| `reset.button` | `Скинути прогрес` | `Reset progress` |
| `reset.title` | `Скинути весь прогрес?` | `Reset all progress?` |
| `reset.body` | `Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.` | `Your balance, clicks and purchases will be reset. Theme and language stay.` |
| `reset.confirm` | `Скинути` | `Reset` |
| `reset.cancel` | `Скасувати` | `Cancel` |
| `shop.title` | `Магазин` | `Shop` |
| `shop.category.skins` | `Скіни` | `Skins` |
| `shop.category.decor` | `Декор` | `Decor` |
| `shop.category.upgrades` | `Покращення` | `Upgrades` |
| `shop.buy` | `Купити за {price}` | `Buy for {price}` |
| `shop.owned` | `Куплено` | `Owned` |
| `shop.requires` | `Потрібно: {item}` | `Requires: {item}` |
| `shop.count` | `Маєте: {count}` | `Owned: {count}` |
| `skin.on` | `Увімкнено` | `On` |
| `skin.off` | `Вимкнено` | `Off` |
| `item.soft-shadow.name` | `М’яка тінь` | `Soft shadow` |
| `item.soft-shadow.description` | `Тінь, що глибшає під курсором і при натисканні` | `A shadow that deepens on hover and press` |
| `item.squish.name` | `Желе` | `Squish` |
| `item.squish.description` | `Кнопка сплющується й пружинить після кліку` | `Jelly-like squash and spring-back on click` |
| `item.floating-number.name` | `Спливаючі +N` | `Floating +N` |
| `item.floating-number.description` | `Зароблене спливає від курсора й тане` | `The earned amount floats up from the cursor and fades` |
| `item.jumping-cap.name` | `Кепка-стрибунець` | `Jumping cap` |
| `item.jumping-cap.description` | `Кепка на кнопці підстрибує з кожним кліком` | `A cap sits on the button and hops on each click` |
| `item.gold.name` | `Золото` | `Gold` |
| `item.gold.description` | `Металева золота поверхня` | `Metallic gold surface` |
| `item.sleeping-cat.name` | `Сплячий кіт` | `Sleeping cat` |
| `item.sleeping-cat.description` | `Кіт повільно дихає, часом ворушить вухами` | `A cat that slowly breathes, ears twitch now and then` |
| `item.lava-lamp.name` | `Лава-лампа` | `Lava lamp` |
| `item.lava-lamp.description` | `Краплі воску здіймаються й зливаються` | `Blobs rising and merging` |
| `item.hydraulic-press.name` | `Гідравлічний прес` | `Hydraulic press` |
| `item.hydraulic-press.description` | `Прес повільно чавить нескінченну низку предметів` | `A press slowly crushing an endless line of objects` |
| `item.double-click.name` | `Подвійний клік` | `Double click` |
| `item.double-click.description` | `Кожен клік приносить ×2` | `Each click is worth ×2` |
| `item.triple-click.name` | `Потрійний клік` | `Triple click` |
| `item.triple-click.description` | `Кожен клік приносить ×3 (замість ×2)` | `Each click is worth ×3 (replaces ×2)` |
| `item.monkey.name` | `Мавпочка` | `Monkey` |
| `item.monkey.description` | `Сама тисне свою кнопку: 1 клік за секунду` | `Presses its own button: 1 click per second` |
| `helper.monkey.label` | `Мавпочки: {count} (+{rate} за секунду)` | `Monkeys: {count} (+{rate} per second)` |

#### Scenario: Key parity [unit]
- **WHEN** the key sets of `uk` and `en` are compared (sorted)
- **THEN** they are identical

#### Scenario: No empty values [unit]
- **WHEN** every value of `uk` and `en` is checked
- **THEN** each is a string with `trim().length > 0`

#### Scenario: Required Stage 1 keys and copy [unit]
- **WHEN** the dictionaries are read
- **THEN** the key set of each equals exactly the 44 keys in the table above
- **AND** `uk["mainButton.label"]` is `Клік` and `en["mainButton.label"]` is `Click`
- **AND** `uk["reset.button"]` is `Скинути прогрес` and `en["reset.button"]` is `Reset progress`
- **AND** `uk["reset.body"]` is `Баланс, кліки й покупки буде обнулено. Тема й мова залишаться.`

#### Scenario: Every shop item has a name and description [unit]
- **WHEN** for each of the 11 ids `soft-shadow`, `squish`, `floating-number`, `jumping-cap`, `gold`, `sleeping-cat`, `lava-lamp`, `hydraulic-press`, `double-click`, `triple-click`, `monkey` the keys `item.<id>.name` and `item.<id>.description` are looked up in `uk` and `en`
- **THEN** all 44 lookups return the values from the table above

#### Scenario: Shop interpolation [unit]
- **WHEN** `t("uk", "shop.buy", { price: "1 500" })`, `t("en", "shop.buy", { price: "1,500" })`, `t("uk", "shop.requires", { item: "Подвійний клік" })`, `t("en", "helper.monkey.label", { count: 3, rate: 3 })` are called
- **THEN** the results are `Купити за 1 500`, `Buy for 1,500`, `Потрібно: Подвійний клік`, `Monkeys: 3 (+3 per second)`

### Requirement: Translation function
`t(language, key, params?)` SHALL return the dictionary value for the language and replace every
`{name}` placeholder with `String(params[name])`. Placeholders without a matching param SHALL stay
unchanged.

#### Scenario: Plain lookup [unit]
- **WHEN** `t("uk", "mainButton.label")` and `t("en", "mainButton.label")` are called
- **THEN** the results are `Клік` and `Click`

#### Scenario: Interpolation [unit]
- **WHEN** `t("en", "balance.ariaLabel", { value: "1,234" })` is called
- **THEN** the result is `Balance: 1,234`
- **WHEN** `t("uk", "balance.ariaLabel", { value: 7 })` is called
- **THEN** the result is `Баланс: 7`

#### Scenario: Missing param keeps placeholder [unit]
- **WHEN** `t("en", "balance.ariaLabel")` is called
- **THEN** the result is `Balance: {value}`

### Requirement: Number formatting
The balance SHALL be formatted with the grouping rules of the current language: `uk` uses U+00A0
(no-break space) as the thousands separator, `en` uses a comma.

#### Scenario: Format numbers [unit]
- **WHEN** `formatNumber(0, "uk")`, `formatNumber(999, "uk")`, `formatNumber(1234, "uk")`, `formatNumber(1234567, "uk")` are called
- **THEN** the results are `"0"`, `"999"`, `"1 234"`, `"1 234 567"`
- **WHEN** `formatNumber(1234, "en")` and `formatNumber(1234567, "en")` are called
- **THEN** the results are `"1,234"` and `"1,234,567"`

### Requirement: Language preference
The language SHALL default to `uk`. The saved value SHALL be read from `dopamine-clicker:lang`;
only the exact strings `"uk"` and `"en"` are valid, anything else counts as "no saved choice"
(default `uk`).

#### Scenario: Parse and resolve language [unit]
- **WHEN** the raw values `"uk"`, `"en"`, `null`, `""`, `"EN"`, `"ua"`, `"de"` are parsed
- **THEN** the results are `"uk"`, `"en"`, `null`, `null`, `null`, `null`, `null` respectively
- **WHEN** language is resolved from `null`
- **THEN** the result is `"uk"`
- **WHEN** language is resolved from `"en"`
- **THEN** the result is `"en"`

#### Scenario: Toggle language [unit]
- **WHEN** `"uk"` is toggled **THEN** the result is `"en"`
- **WHEN** `"en"` is toggled **THEN** the result is `"uk"`

#### Scenario: Load and save language preference [unit]
- **GIVEN** an in-memory storage with `dopamine-clicker:lang` = `"de"`
- **WHEN** preferences are loaded
- **THEN** `language` is `"uk"`
- **WHEN** language `"en"` is saved
- **THEN** the save returns `true`, `getItem("dopamine-clicker:lang")` is `"en"`, and loading preferences gives `language: "en"`

### Requirement: Language switcher in the UI
The page SHALL render all text from the dictionaries and set `<html lang>` to the current language.
A button `[data-testid="lang-toggle"]` next to the theme toggle SHALL show `language.short` of the
current language, carry `language.switch` as its `aria-label`, switch to the other language on
click, and save the choice to `dopamine-clicker:lang`.

#### Scenario: Ukrainian by default [e2e]
- **GIVEN** empty storage and browser locale `en-US` (Playwright default)
- **WHEN** the page `/` is loaded
- **THEN** `<html>` has `lang="uk"`
- **AND** `[data-testid="main-button"]` has text `Клік`
- **AND** `[data-testid="reset"]` has text `Скинути прогрес`
- **AND** `[data-testid="lang-toggle"]` has text `УКР`

#### Scenario: Switch to English and persist [e2e]
- **GIVEN** the page `/` is loaded with empty storage
- **WHEN** the user clicks `[data-testid="lang-toggle"]`
- **THEN** `<html>` has `lang="en"`, the main button text is `Click`, the reset text is `Reset progress`, the lang toggle text is `ENG`
- **AND** `localStorage["dopamine-clicker:lang"]` is `"en"`
- **WHEN** the page is reloaded
- **THEN** `<html>` has `lang="en"` and the main button text is `Click`

#### Scenario: Switch back to Ukrainian [e2e]
- **GIVEN** `localStorage["dopamine-clicker:lang"]` is seeded with `en` before the first page load
- **WHEN** the page `/` is loaded and the user clicks `[data-testid="lang-toggle"]`
- **THEN** `<html>` has `lang="uk"`, the main button text is `Клік`, and `localStorage["dopamine-clicker:lang"]` is `"uk"`

#### Scenario: Balance formatting follows language [e2e]
- **GIVEN** `localStorage["dopamine-clicker:save"]` is seeded with `{"version":1,"state":{"balance":1234,"totalClicks":1234}}` and `localStorage["dopamine-clicker:lang"]` with `en` before the first page load
- **WHEN** the page `/` is loaded
- **THEN** `[data-testid="balance"]` has text `1,234`
- **WHEN** the user clicks `[data-testid="lang-toggle"]`
- **THEN** `[data-testid="balance"]` text with whitespace normalized to plain spaces is `1 234`

#### Scenario: Reset dialog is localized [e2e]
- **GIVEN** the page `/` is loaded in English (lang toggled once)
- **WHEN** the user clicks `[data-testid="reset"]`
- **THEN** `[data-testid="reset-confirm"]` has text `Reset` and `[data-testid="reset-cancel"]` has text `Cancel`
