import { supabase } from "$lib/supabase";
import { redirect } from "@sveltejs/kit";

export const load = async ({ params }) => {
    let item_id = params.item_id;
    let query = await supabase.from('Items').select('item_name').eq('id', item_id);

    if (query.data.length == 0) throw redirect(301, '/');
    throw redirect(301, '/?search=' + (query.data[0].item_name).replace(/ /g, '%20'));
};
