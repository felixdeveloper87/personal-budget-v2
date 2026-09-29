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
        assertThat(MerchantBrandCatalog.resolve("OVO Energy gas bill"))
                .contains(new MerchantBrand("OVO Energy", "ovoenergy.com"));
        assertThat(MerchantBrandCatalog.resolve("100Green electricity"))
                .contains(new MerchantBrand("100Green", "100green.com"));
        assertThat(MerchantBrandCatalog.resolve("Community Fibre broadband"))
                .contains(new MerchantBrand("Community Fibre", "communityfibre.co.uk"));
        assertThat(MerchantBrandCatalog.resolve("SES Water bill"))
                .contains(new MerchantBrand("SES Water", "seswater.co.uk"));
        assertThat(MerchantBrandCatalog.resolve("Octopus Energy monthly bill"))
                .contains(new MerchantBrand("Octopus Energy", "octopus.energy"));
    }

    @Test
    void resolvesDiningMerchantsToVerifiedDomains() {
        assertThat(MerchantBrandCatalog.resolve("Pret A Manger London"))
                .contains(new MerchantBrand("Pret A Manger", "pret.co.uk"));
        assertThat(MerchantBrandCatalog.resolve("Wagamama dinner"))
                .contains(new MerchantBrand("Wagamama", "wagamama.com"));
        assertThat(MerchantBrandCatalog.resolve("Pizza Pilgrims Soho"))
                .contains(new MerchantBrand("Pizza Pilgrims", "pizzapilgrims.co.uk"));
    }

    @Test
    void resolvesHealthMerchantsToVerifiedDomains() {
        assertThat(MerchantBrandCatalog.resolve("Specsavers eye test"))
                .contains(new MerchantBrand("Specsavers", "specsavers.co.uk"));
        assertThat(MerchantBrandCatalog.resolve("Nuffield Health appointment"))
                .contains(new MerchantBrand("Nuffield Health", "nuffieldhealth.com"));
    }

    @Test
    void doesNotMatchAliasesInsideOtherWords() {
        assertThat(MerchantBrandCatalog.resolve("Subway"))
                .contains(new MerchantBrand("Subway", "subway.com"));
        assertThat(MerchantBrandCatalog.resolve("Subwayland"))
                .isEmpty();
    }
}
