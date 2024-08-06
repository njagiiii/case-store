import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'


const DashboardPage = async () => {
    // secure dashboard
    const {getUser} = getKindeServerSession()
    const user =await getUser()

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL

    // check for regular user and admin
    if(!user || user.email !== ADMIN_EMAIL){
        return notFound()
    }

    // show orders on dashboard
    const orders = await db.order.findMany({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date(). setDate(new Date().getDate() - 7))
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: true,
            shippingAddress:true
        }

    })

    // grab money made lastweek
    const lastWeekSum = await db.order.aggregate({
        where: {
            isPaid: true,
            createdAt: {
                gte: new Date(new Date(). setDate(new Date().getDate() - 7))
            }
        },
        _sum : {
            amount: true
        }

    })
  return <div className="flex min-h-screen w-full bg-muted/40">
    <div className="max-w-7xl w-full mx-auto flex flex-col sm:gap-4 sm:py-4">
        <div className="flex flex-col gap-16">
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className='pb-2'>
                        <CardDescription>Last Week</CardDescription>
                        <CardTitle className='text-4xl'>{formatPrice(lastWeekSum._sum.amount ?? 0)}</CardTitle>
                    </CardHeader>
                </Card>
            </div>
        </div>
    </div>
  </div>
}

export default DashboardPage