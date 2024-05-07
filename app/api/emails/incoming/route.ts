import * as z from "zod"
import { db } from "@/lib/db"
import { nanoid } from "@/lib/utils"
import { OutboundEmailStatus, SubscriberStatus } from "@prisma/client"
import { makeSlug } from "@/lib/slug"


const cloudinary = require('cloudinary')
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


async function uploadImage(data: string, file: any): Promise<any>{
  console.log('uploading', file)
  return new Promise((resolve, reject) => {
    return cloudinary.v2.uploader.upload(data,
    { public_id: file.id, colors: true, phash: true, media_metadata: true, context: file  }, 
    function(error: any, result: any) {
      if(error) {
        console.log('error', error)
        reject(error)
        return
      }
      resolve(result)
    });
  }) 
}


export async function POST(req: Request) {
  try {
    const json = await req.json()
    const toTokens = json.To.split('<')
    const inboundAddress = toTokens.length > 1 ? toTokens[1].split('>')[0] : toTokens[0]
    console.log('incoming email json data', json.From, json.Subject, json.To, json.FromName, json.MessageID)
    const { TextBody, HtmlBody, From, Subject, To, FromName, MessageID, Headers, Attachments } = json
    const newsletter = await db.newsletter.findUnique({
      where: {
        inboundAddress: inboundAddress
      },
      include: {
        user: true
      }
    })
    console.log('newsletter found', newsletter, inboundAddress)
    if(!newsletter) {
      return new Response(null, { status: 404 })
    }
    // check that from user matches user and one of editorsEmails
    if(newsletter.user.email !== From && newsletter.editorsEmails?.indexOf(From) == -1) {
      // do nothing here
      return new Response(null, { status: 404 })
    }

    const attachment = Attachments && Attachments.length > 0 ? Attachments[0] : null
    const attachmentsWithNotContent = (Attachments||[]).map((attachment: any)=> {
      delete attachment['Content']
      return attachment
    })
    // TODO do loop
    // if(attachment) {
    //   const dataUrl = `data:${attachment.ContentType};base64,` + attachment.Content
    //   console.log('attachment', Object.keys(attachment), attachment.Content?.length, dataUrl.substring(0, 10))
    //   const cloudinaryResp = await uploadImage(dataUrl, {
    //     id: attachment.ContentID,
    //     newsletterId: newsletter.id,
    //     postmarkId: MessageID,
    //   })
    //   console.log('cloudinary', cloudinaryResp)
    //   if(cloudinaryResp) {
    //     const providerData = cloudinaryResp || {}
    //     // 
    //     const imageMetadata = providerData.image_metadata || {}
    //     const extraMeta = providerData.context?.custom || {}
    //     const colors = providerData.colors || {}
    //     const predominantColors = providerData.predominant || {}
    //     const {phash,semi_transparent, grayscale, asset_id, width, height, bytes, format} = providerData
    //     const imgData = {
    //       newsletterId: newsletter.id,
    //       userId: newsletter.userId,
    //       externalId: attachment.ContentID,
    //       assetId: asset_id,
    //       cloudCreatedAt: providerData.created_at,
    //       format,
    //       url: providerData.secure_url,
    //       originalFilename: attachment.Name,
    //       colors: colors,
    //       predominantColors,
    //       metadata: extraMeta,
    //       imageMetadata: imageMetadata,
    //       width, 
    //       height,
    //       bytes,
    //       phash,
    //       semiTransparent: semi_transparent,
    //       grayscale,
    //     }
    //     const dbImage = await db.image.create({
    //       data: imgData
    //     })
    //     console.log('dbImage', dbImage)
    //   }
    // }
    
    const subjectSlug = makeSlug(Subject)
    const slug = subjectSlug && subjectSlug.length > 0 ? `${subjectSlug}-${nanoid(6)}`: `issue-${nanoid(6)}`
    // TODO save attachment meta on email. Delete content.
    const email = await db.email.create({
      data: {
        newsletterId: newsletter.id,
        slug,
        subject: Subject,
        textBody: TextBody,
        htmlBody: HtmlBody || TextBody,
        postmarkId: MessageID,
        headers: Headers,
        attachments: attachmentsWithNotContent
      }
    })
    // TODO we pretend it's approved.
    // but we need to add this code in another place

    const subscribers = await db.subscriber.findMany({
      where: {
        newsletterId: newsletter.id,
        status: SubscriberStatus.VERIFIED
      }
    })
    await db.outboundEmail.createMany({
      data: subscribers.map((subscriber) => {
        return {
          emailId: email.id,
          newsletterId: newsletter.id,
          subscriberId: subscriber.id,
          status: OutboundEmailStatus.PENDING
        }
      })
    })

    return new Response(JSON.stringify({}))
  } catch (error) {
    console.log('cannot create email', error)
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}

// basically I need to replace all the images.
// <img src=\"cid:F4715E85-5CBF-42C3-ADE9-85A439EEF0CC\" alt=\"IMG_6310.jpeg\">
// {
//   "ContentLength": 43119,
//   "Name": "IMG_6310.jpeg",
//   "ContentType": "image/jpeg",
//   "ContentID": "F4715E85-5CBF-42C3-ADE9-85A439EEF0CC"
// }