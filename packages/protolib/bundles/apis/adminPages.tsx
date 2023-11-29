
import { AdminPage, PaginatedDataSSR } from 'protolib/adminpanel/features/next'
import { APIModel } from '.'
import { DataTable2, API, DataView, AlertDialog } from 'protolib'
import { YStack, Text, Stack, XStack } from "@my/ui";
import { ToyBrick, Eye } from '@tamagui/lucide-icons'
import { z } from 'protolib/base'
import { usePageParams } from '../../next'
import { getURLWithToken } from '../../lib/Session'
import { usePrompt } from '../../context/PromptAtom'
import { Chip } from '../../components/Chip'
import { useState } from 'react'
import Center from '../../components/Center'
import { Objects } from "app/bundles/objects";
import { Tinted } from '../../components/Tinted';

const APIIcons = {}

const MethodBadge = ({ method, path, description }) => {
    return (
        <Tinted>
            <XStack
                borderColor={"$color3"}
                borderWidth={1}
                borderRadius={10}
                padding={10}
                marginVertical={5}
                minWidth={"500px"}
                ai="center"
                mb={"$3"}
                pr={"$10"}
                hoverStyle={{ backgroundColor: '$color2' }}
            >
                <XStack alignItems="center" space>
                    <Stack p={"$1"} backgroundColor={method === 'GET' ? '$color7' : '$color4'} br={"$2"}>
                        <Text fontSize={14} fontWeight="bold" color="white" padding={5} borderRadius={5} >
                            {method}
                        </Text>
                    </Stack>

                    <Text fontWeight="bold" flex={1}>
                        {path}
                    </Text>
                </XStack>
                <XStack ml={"$3"}>
                    <Text color="$grey" fontSize={14}>
                        {description}
                    </Text>
                </XStack>

            </XStack>
        </Tinted>
    );
};

export default {
    'admin/apis': {
        component: ({ pageState, sourceUrl, initialItems, pageSession, extraData }: any) => {
            const { replace } = usePageParams(pageState)
            console.log('initialItems: ', initialItems)
            usePrompt(() => `At this moment the user is browsing the Rest API management page. The Rest API management page allows to list, create, read, update and delete API definitions. API definitions are typescript files using express.
            The system allows to create APIs either from an empty template, or from an AutoCRUD template. The automatic crud template creates an automatic CRUD API for a given object. 
            To Automatic CRUD API generates the following endpoints: get /api/v1/:objectName (list), post /api/v1/:objectName (create), post /api/v1/:objectName/:objectId (update), get /api/v1/:objectName/:objectId/delete (delete) and get /api/v1/:objectName/:objectId (read)
            the API files are located at /packages/app/bundles/custom/apis. 
            The Automatic CURD system can be manually extended to have more endpoints.
            The user can edit the API files by clicking on any API, and can choose visual programming using interactive diagrams generated from the source code, or text based tradicional programming to edit the .ts api file.
            Those APIs allow the user to create pages based on object data. The automatic crud is an "storage" to manage data for a specific object.
            ` + (
                    initialItems.isLoaded ? 'Currently the system returned the following information: ' + JSON.stringify(initialItems.data) : ''
                ))

            const [dialogOpen, setDialogOpen] = useState(false)
            const [currentElement, setCurrentElement] = useState({})
            let options = {}
            const ObjectModel = currentElement?.data?.object ? Objects[currentElement?.data?.object] : null
            if (ObjectModel) {
                options = Objects.patata.getApiOptions()
            }
            //replace('editFile', '/packages/app/bundles/custom/apis/')
            return (<AdminPage title="APIs" pageSession={pageSession}>
                <AlertDialog
                    acceptCaption="Close"
                    cancelCaption="Keep editing"
                    onAccept={async () => {

                    }}
                    open={dialogOpen}
                    setOpen={setDialogOpen}
                    title={"API Endpoints"}
                    description=""
                >
                    <Center mt="$5">
                        <YStack>
                            <MethodBadge
                                method="GET"
                                path={options ? options.prefix + options.name : ""}
                                description={"List all " + currentElement?.data?.name + " entries"}
                            />
                            <MethodBadge
                                method="POST"
                                path={options ? options.prefix + options.name : ""}
                                description={"Creates a new " + currentElement?.data?.name + " entry"}
                            />
                            <MethodBadge
                                method="GET"
                                path={options ? options.prefix + options.name + "/:id" : ""}
                                description={"Reads a " + currentElement?.data?.name + " entry by id"}
                            />
                            <MethodBadge
                                method="POST"
                                path={options ? options.prefix + options.name + "/:id" : ""}
                                description={"Updates a " + currentElement?.data?.name + " entry by id"}
                            />
                            <MethodBadge
                                method="POST"
                                path={options ? options.prefix + options.name + "/:id/delete" : ""}
                                description={"Deletes a " + currentElement?.data?.name + " entry by id"}
                            />
                        </YStack>
                    </Center>
                </AlertDialog>
                <DataView
                    integratedChat
                    onSelectItem={(item) => replace('editFile', '/packages/app/bundles/custom/apis/' + item.data.name + '.ts')}
                    rowIcon={ToyBrick}
                    sourceUrl={sourceUrl}
                    initialItems={initialItems}
                    numColumnsForm={1}
                    name="api"
                    columns={DataTable2.columns(
                        DataTable2.column("name", "name", true),
                        DataTable2.column("type", "type", true, row => <Chip text={row.type.toUpperCase()} color={row.type == 'AutoAPI' ? '$color5' : '$'} />),
                        DataTable2.column("object", "object", true, row => <Chip text={row.object} color={row.object == 'None' ? '$gray5' : '$color5'} />),
                    )}
                    extraFieldsFormsAdd={{
                        template: z.union([z.literal("Automatic CRUD"), z.literal("Automatic CRUD (custom storage)"), z.literal("IOT Router"), z.literal("empty")]).display().after("name"),
                        object: z.union([z.literal("without object"), ...extraData.objects.map(o => z.literal(o.name))] as any).after('name').display(),
                    }}
                    extraMenuActions={[
                        {
                            text: "Show API",
                            icon: Eye,
                            action: (element) => { setDialogOpen(true); setCurrentElement(element); console.log("DATA", element) },
                            isVisible: (data) => data.data.type === "AutoAPI" ? true : false
                        }
                    ]}
                    model={APIModel}
                    pageState={pageState}
                    icons={APIIcons}
                />
            </AdminPage>)
        },
        getServerSideProps: PaginatedDataSSR('/adminapi/v1/apis', ['admin'], {}, async (context) => {
            const objects = await API.get(getURLWithToken('/adminapi/v1/objects?all=1', context))
            return {
                objects: objects.isLoaded ? objects.data.items : []
            }
        })
    }
}