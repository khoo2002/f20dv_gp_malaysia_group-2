// load_data.js - Responsible for loading and filtering the dataset

// Function to load the dataset
export async function loadDatabaseEurope() {
    let data = await d3.json("data/database_Europe_clean1_iqr_log_transformed.json");
    return data.map(d => ({
        country: d.country,
        year: +d.year,
        fatal_pc_km: d.fatal_pc_km ? parseFloat(d.fatal_pc_km) : null,
        fatal_mIn: parseFloat(d.fatal_mIn),
        accid_adj_pc_km: d.accid_adj_pc_km ? parseFloat(d.accid_adj_pc_km) : null,
        p_km: parseFloat(d.p_km),
        croad_inv_km: parseFloat(d.croad_inv_km),
        croad_maint_km: parseFloat(d.croad_maint_km),
        prop_motorwa: parseFloat(d.prop_motorwa),
        populat: parseFloat(d.populat),
        unemploy: parseFloat(d.unemploy),
        petrol_car: parseFloat(d.petrol_car),
        alcohol: parseFloat(d.alcohol),
        mot_index_1000: parseFloat(d.mot_index_1000),
        den_populat: parseFloat(d.den_populat),
        cgdp: parseFloat(d.cgdp),
        cgdp_cap: parseFloat(d.cgdp_cap),
        precipit: parseFloat(d.precipit),
        prop_elder: parseFloat(d.prop_elder),
        dps: d.dps === 0 ? 0.000001 : parseInt(d.dps), // Default to 0 if missing
        freight: parseFloat(d.freight)
    }));
}

// Function to filter specific attributes from the dataset
export function filterData(data, attributes) {
    return data.map(d => {
        let filtered = {};
        attributes.forEach(attr => {
            filtered[attr] = d[attr];
        });
        return filtered;
    });
}

console.log("load_data.js: Data loading functions ready.");