import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

async function handleEvent(event) {
  try {
    return await getAssetFromKV(event)
  } catch (e) {
    return await getAssetFromKV(event, {
      mapRequestToAsset: (request) => {
        return mapRequestToAsset(new Request(`https://${request.host}/`, request))
      }
    })
    // return new Response('notfound', { status: 404 })
  }
}
