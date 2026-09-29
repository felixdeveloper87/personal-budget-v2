package com.example.budget.merchant;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Single source of truth for merchant aliases used by every API client.
 * Clients receive only a canonical name and verified domain, so they never
 * need to send raw transaction descriptions to a third-party logo search.
 */
public final class MerchantBrandCatalog {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9]+");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private static final List<Entry> ENTRIES = List.of(
            entry("Marks & Spencer", "marksandspencer.com", "marks and spencer", "marks & spencer", "m&s", "m & s", "m and s"),
            entry("Pepe's Piri Piri", "pepes.co.uk", "pepe's piri piri", "pepes piri piri", "pepe's", "pepes"),
            entry("Costco", "costco.co.uk", "costco"),
            entry("Lidl", "lidl.co.uk", "lidl"),
            entry("Sainsbury's", "sainsburys.co.uk", "sainsbury's", "sainsburys", "sainsbury"),
            entry("Morrisons", "morrisons.com", "morrisons"),
            entry("Waitrose", "waitrose.com", "waitrose"),
            entry("Iceland", "iceland.co.uk", "iceland"),
            entry("Tesco", "tesco.com", "tesco"),
            entry("Aldi", "aldi.co.uk", "aldi"),
            entry("Asda", "asda.com", "asda"),
            entry("Co-op", "coop.co.uk", "co-op", "co op", "coop"),
            entry("Amazon", "amazon.co.uk", "amazon"),
            entry("Uber Eats", "ubereats.com", "uber eats"),
            entry("Deliveroo", "deliveroo.co.uk", "deliveroo"),
            entry("Just Eat", "just-eat.co.uk", "just eat"),
            entry("Uber", "uber.com", "uber"),
            entry("Bolt", "bolt.eu", "bolt"),
            entry("McDonald's", "mcdonalds.com", "mcdonald's", "mcdonalds"),
            entry("Nando's", "nandos.co.uk", "nando's", "nandos"),
            entry("Burger King", "burgerking.co.uk", "burger king"),
            entry("Costa Coffee", "costa.co.uk", "costa coffee", "costa"),
            entry("Domino's", "dominos.co.uk", "domino's", "dominos"),
            entry("Greggs", "greggs.co.uk", "greggs"),
            entry("Subway", "subway.com", "subway"),
            entry("KFC", "kfc.co.uk", "kfc"),
            entry("Boots", "boots.com", "boots"),
            entry("Superdrug", "superdrug.com", "superdrug"),
            entry("Primark", "primark.com", "primark"),
            entry("River Island", "riverisland.com", "river island"),
            entry("New Look", "newlook.com", "new look"),
            entry("Zara", "zara.com", "zara"),
            entry("H&M", "hm.com", "h&m", "h & m"),
            entry("ASOS", "asos.com", "asos"),
            entry("Spotify", "spotify.com", "spotify"),
            entry("Netflix", "netflix.com", "netflix"),
            entry("YouTube", "youtube.com", "youtube"),
            entry("OpenAI", "openai.com", "chatgpt", "openai"),
            entry("Claude", "claude.ai", "claude"),
            entry("Disney+", "disneyplus.com", "disney+", "disney plus"),
            entry("PlayStation", "playstation.com", "playstation"),
            entry("Xbox", "xbox.com", "xbox"),
            entry("Airbnb", "airbnb.co.uk", "airbnb"),
            entry("Booking.com", "booking.com", "booking.com", "booking"),
            entry("Trainline", "thetrainline.com", "trainline"),
            entry("TfL", "tfl.gov.uk", "tfl", "transport for london"),
            entry("Vinted", "vinted.co.uk", "vinted"),
            entry("eBay", "ebay.co.uk", "ebay"),
            entry("Etsy", "etsy.com", "etsy"),
            entry("Royal Mail", "royalmail.com", "royal mail", "royalmail")
    );

    private MerchantBrandCatalog() {
    }

    public static Optional<MerchantBrand> resolve(String description) {
        String value = normalize(description);
        if (value.isEmpty()) {
            return Optional.empty();
        }

        Entry best = null;
        int bestLength = -1;
        for (Entry entry : ENTRIES) {
            for (String alias : entry.aliases()) {
                if (containsPhrase(value, alias) && alias.length() > bestLength) {
                    best = entry;
                    bestLength = alias.length();
                }
            }
        }
        return best == null ? Optional.empty() : Optional.of(best.brand());
    }

    private static Entry entry(String name, String domain, String... aliases) {
        return new Entry(
                new MerchantBrand(name, domain),
                List.of(aliases).stream().map(MerchantBrandCatalog::normalize).toList());
    }

    private static boolean containsPhrase(String value, String phrase) {
        return (" " + value + " ").contains(" " + phrase + " ");
    }

    private static String normalize(String value) {
        if (value == null) {
            return "";
        }
        String withoutDiacritics = DIACRITICS.matcher(
                Normalizer.normalize(value, Normalizer.Form.NFD)).replaceAll("");
        String wordsOnly = NON_ALPHANUMERIC.matcher(
                withoutDiacritics.toLowerCase(Locale.ROOT)).replaceAll(" ");
        return WHITESPACE.matcher(wordsOnly).replaceAll(" ").trim();
    }

    private record Entry(MerchantBrand brand, List<String> aliases) {
    }
}
