package com.example.budget.merchant;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class MerchantBrandCatalogTest {

    @Test
    void resolvesAmbiguousAliasesToVerifiedDomains() {
        assertThat(MerchantBrandCatalog.resolve("M&S Food Hall London"))
                .contains(new MerchantBrand("Marks & Spencer", "marksandspencer.com"));
        assertThat(MerchantBrandCatalog.resolve("PEPE'S PIRI PIRI #42"))
                .contains(new MerchantBrand("Pepe's Piri Piri", "pepes.co.uk"));
    }

    @Test
    void prefersTheLongestMatchingAlias() {
        assertThat(MerchantBrandCatalog.resolve("Uber Eats London"))
                .contains(new MerchantBrand("Uber Eats", "ubereats.com"));
    }

    @Test
    void resolvesUtilityProvidersToVerifiedDomains() {
        assertThat(MerchantBrandCatalog.resolve("Octopus Energy monthly bill"))
                .contains(new MerchantBrand("Octopus Energy", "octopus.energy"));
        assertThat(MerchantBrandCatalog.resolve("Virgin Media broadband"))
                .contains(new MerchantBrand("Virgin Media", "virginmedia.com"));
    }

    @Test
    void resolvesDiningMerchantsToVerifiedDomains() {
        assertThat(MerchantBrandCatalog.resolve("Pret A Manger London"))
                .contains(new MerchantBrand("Pret A Manger", "pret.co.uk"));
        assertThat(MerchantBrandCatalog.resolve("Wagamama dinner"))
                .contains(new MerchantBrand("Wagamama", "wagamama.com"));
    }

    @Test
    void doesNotMatchAliasesInsideOtherWords() {
        assertThat(MerchantBrandCatalog.resolve("Subway"))
                .contains(new MerchantBrand("Subway", "subway.com"));
        assertThat(MerchantBrandCatalog.resolve("Subwayland"))
                .isEmpty();
    }
}
