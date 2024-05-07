const postmark = require("postmark")
const amrhextotext = require('amrhextotext')

export async function sendConfirmationEmail(subscriberId: string, email: string, newsletter: any) {
  const subscriberHashId = amrhextotext.textToHex(subscriberId)
      
  const tokens = (newsletter.postmarkServer || {})['ApiTokens'] || []
  const apiToken = tokens[0] || ""
  const text = `[Click here to confirm](https://${newsletter.username}.recur.email/confirm/${subscriberHashId}) your subscription to [${newsletter.name || newsletter.username}](https://${newsletter.username}.recur.email).\n\n
  If you didn't subscribe to this list or you're not sure why you received this email, you can delete it.\n 
  You will not be subscribed if you don't click on the link above.
  \n
  ---
  This email brought to you by [recur.email](https://recur.email), the simplest way to create and write your newsletter.`
  const html = `<a data-pm-no-track href="https://${newsletter.username}.recur.email/confirm/${subscriberHashId}">Click here to confirm</a> your subscription to <a data-pm-no-track href="https://${newsletter.username}.recur.email">${newsletter.name || newsletter.username}</a>.
  <br />
  <br />
  If you didn't subscribe to this list or you're not sure why you received this email, you can delete it.</br>
  You will not be subscribed if you don't click on the link above.
  <br /> <br />

  ---

  <br /><br />
  This email brought to you by <a data-pm-no-track href="https://recur.email">recur.email</a>, the simplest way to create and write your newsletter.`
  const from = newsletter.fromName ? `${newsletter.fromName} <${email}>`: email
  await sendMail(
    from,
    `Confirm your subscription to ${newsletter.name || newsletter.username}`,
    html,
    text,
    'outbound', 'confirm-subscription',
    apiToken,
    newsletter.username + '@recur.email'
  )
  return 
}

export async function sendMail(to, subject, html, text, messageStream, tag, apiToken=process.env.POSTMARK_API_TOKEN, from="no-reply@recur.email") {
  const client = new postmark.ServerClient(apiToken)
  const resp = await client.sendEmail({
    "From": from,
    "To": to,
    "Subject": subject,
    "HtmlBody": html,
    "TextBody": text,
    "MessageStream": messageStream,
    Tag: tag
  });
  console.log('email resp', resp);
  return resp
}

export async function sendBatchMail(emails: any[], apiToken=process.env.POSTMARK_API_TOKEN) {
  const client = new postmark.ServerClient(apiToken)
  const resp = await client.sendEmailBatch(emails.map((email) => {
    email['MessageStream'] = 'broadcast'
    email['Tag'] = 'send-issue'
    email['Metadata'] = {
      'emailId': email['EmailID'],
      'subscriberId': email['SubscriberID']
    }
    delete email['ApiToken']
    return email
  }));
  console.log('email resp', resp);
  return resp
}


export async function createMailServer(username: string) {
  const postmarkAdminToken = process.env.POSTMARK_ADMIN_API_TOKEN || ''
  const inboundAddress = `write@${username}.recur.email`
  const postmarkResponse = await fetch("https://api.postmarkapp.com/servers", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Account-Token": postmarkAdminToken,
    },
    body: JSON.stringify({
      Name: `${username}.recur.email`,
      Color: "Yellow",
      SmtpApiActivated: true,
      // this will be different for each user
      InboundDomain: `${username}.recur.email`,
      // InboundAddress: inboundAddress,
      InboundHookUrl: `https://recur.email/api/emails/incoming`,
    })
  })
  if(postmarkResponse.ok) { 
    const postmarkServer = await postmarkResponse.json()
    return {postmarkServer, inboundAddress}
  }
  const error = await postmarkResponse.json()
  return {
    postmarkServer: null,
    inboundAddress,
    error
  }
}

export async function updateMailServer(serverId: number, trackOpens?: boolean, trackLinks?: boolean) {
  const postmarkAdminToken = process.env.POSTMARK_ADMIN_API_TOKEN || ''
  let settings = {}
  if(trackOpens == true || trackOpens == false) {
    settings['TrackOpens'] = trackOpens
  }
  if(trackLinks == true || trackLinks == false) {
    settings['TrackLinks'] = trackLinks == true ? 'HtmlOnly' : 'None' 
  }
  console.log('settings', settings)
  const postmarkResponse = await fetch(`https://api.postmarkapp.com/servers/${serverId}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Account-Token": postmarkAdminToken,
    },
    body: JSON.stringify(settings)
  })
  if(postmarkResponse.ok) { 
    const postmarkServer = await postmarkResponse.json()
    return {postmarkServer}
  }
  const error = await postmarkResponse.json()
  return {
    postmarkServer: null,
    error
  }
}

export async function getServerMessageStreams(apiToken: string) {
  const postmarkResponse = await fetch(`https://api.postmarkapp.com/message-streams`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
  })
  if(postmarkResponse.ok) { 
    const postmarkMessageStreams = await postmarkResponse.json()
    return {postmarkMessageStreams}
  }
  const error = await postmarkResponse.json()
  return {
    postmarkMessageStreams: null,
    error
  }
}

export async function editServerMessageStreams(apiToken: string, streamId: string) {
  const postmarkResponse = await fetch(`https://api.postmarkapp.com/message-streams/${streamId}`, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
    body: JSON.stringify({
      "SubscriptionManagementConfiguration": {
        "UnsubscribeHandlingType": "Custom"
      }
    })
  })
  if(postmarkResponse.ok) { 
    const postmarkMessageStreams = await postmarkResponse.json()
    return {postmarkMessageStreams}
  }
  const error = await postmarkResponse.json()
  return {
    postmarkMessageStreams: null,
    error
  }
}

export async function findSendingEmailMatch(apiToken: string, recipient: string, messageId: string) {
  const apiUrl = `https://api.postmarkapp.com/messages/outbound?count=1&offset=0&messagestream=broadcast&recipient=${recipient}&metadata_emailId=${messageId}`
  // console.log('apiUrl', apiUrl, apiToken)
  const postmarkResponse = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
  })
  if(postmarkResponse.ok) { 
    const {Messages} = await postmarkResponse.json()
    return {messageDetails: Messages && Messages.length > 0 ? Messages[0] : null}
  }
  const error = await postmarkResponse.json()
  return {
    messageDetails: null,
    error
  }
}

export async function findServerSuppressions(apiToken: string, streamId: string) {
  const apiUrl = `https://api.postmarkapp.com/message-streams/${streamId}/suppressions/dump`
  // console.log('apiUrl', apiUrl, apiToken)
  const postmarkResponse = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
  })
  if(postmarkResponse.ok) { 
    const {Suppressions} = await postmarkResponse.json()
    return {suppressions: Suppressions||[]}
  }
  const error = await postmarkResponse.json()
  return {
    suppressions: [],
    error
  }
}

export async function findServerSubscriberOpens(apiToken: string, email: string) {
  const apiUrl = `https://api.postmarkapp.com/messages/outbound/opens?recipient=${email}&count=500&offset=0`
  // console.log('apiUrl', apiUrl, apiToken)
  const postmarkResponse = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
  })
  if(postmarkResponse.ok) { 
    const {Opens} = await postmarkResponse.json()
    return {opens: Opens||[]}
  }
  const error = await postmarkResponse.json()
  return {
    opens: [],
    error
  }
}

export async function findMessageEvents(apiToken: string, messageId: string) {
  const apiUrl = `https://api.postmarkapp.com/messages/outbound/${messageId}/details`
  // console.log('apiUrl', apiUrl, apiToken)
  const postmarkResponse = await fetch(apiUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": apiToken,
    },
  })
  if(postmarkResponse.ok) { 
    const {MessageEvents, ReceivedAt} = await postmarkResponse.json()
    return {events: MessageEvents||[], receivedAt: ReceivedAt}
  }
  const error = await postmarkResponse.json()
  return {
    events: [],
    receivedAt:  null,
    error
  }
}