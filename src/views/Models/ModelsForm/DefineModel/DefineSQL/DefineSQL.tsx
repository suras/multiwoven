import {
	Alert,
	AlertIcon,
	Box,
	Button,
	Flex,
	HStack,
	Image,
	Spacer,
	Text,
	VStack,
	useToast,
} from "@chakra-ui/react";

import StarsImage from "@/assets/images/stars.svg";
import EmptyQueryPreviewImage from "@/assets/images/EmptyQueryPreview.png";

import Editor from "@monaco-editor/react";
import { useContext, useState } from "react";
import { getModelPreview } from "@/services/models";
import { ConvertModelPreviewToTableData } from "@/utils/ConvertToTableData";
import GenerateTable from "@/components/Table/Table";
import { TableDataType } from "@/components/Table/types";
import { SteppedFormContext } from "@/components/SteppedForm/SteppedForm";
import { extractData } from "@/utils";

const DefineSQL = (): JSX.Element => {
	const [query, setQuery] = useState("");
	const [tableData, setTableData] = useState<null | TableDataType>();

	const { state } = useContext(SteppedFormContext);
	const [ loading, setLoading ] = useState(false);

	function handleEditorChange(value: string | undefined) {
		if (value) setQuery(value);
	}

	const extracted = extractData(state.forms);
	const connector_data = extracted.find((data) => data?.id);
	const connector_id = connector_data?.id || "";
	const connector_icon = connector_data?.icon || "";
	const connector_name = connector_data?.name || "";
	const toast = useToast();
	
	async function getPreview() {
		setLoading(true);
		let data = await getModelPreview(query, connector_id?.toString());
		if (data.success) {
			setLoading(false);
			setTableData(ConvertModelPreviewToTableData(data.data));
		} else {
			console.log("error getting data", data);
			toast({
				title: 'An Error Occured',
				description: data.message || 'Please check your query and try again',
				status: 'error',
				duration: 9000,
				isClosable: true,
			  })
			setLoading(false);
		}
	}

	return (
		<Box w='6xl' mx='auto'>
			<VStack>
				<Box
					border='1px'
					borderColor='gray.300'
					w='4xl'
					minH='100%'
					h='xs'
					rounded='xl'
				>
					<Flex bgColor='gray.200' p={2} roundedTop='xl'>
						<Flex w='full' alignItems='center'>
							<Image src={connector_icon} p={2} mx={4} />
							<Text>{connector_name}</Text>
						</Flex>
						<Spacer />
						<HStack spacing={3}>
							<Button
								bgColor='white'
								_hover={{ bgColor: "gray.100" }}
								variant='outline'
								borderColor={"gray.500"}
								onClick={getPreview}
								isLoading={loading}
							>
								{" "}
								Run Query{" "}
							</Button>
							<Button
								bgColor='white'
								_hover={{ bgColor: "gray.100" }}
								variant='outline'
								borderColor={"gray.500"}
							>
								<Image src={StarsImage} w={6} mr={2} /> Beautify
							</Button>
						</HStack>
					</Flex>
					<Box p={3} w='100%'>
						<Editor
							width='100%'
							height='250px'
							language='mysql'
							defaultLanguage='mysql'
							defaultValue='Enter your query...'
							onChange={handleEditorChange}
							theme='light'
						/>
					</Box>
				</Box>

				{tableData ? (
					<Box w='4xl' h='fit'>
						<GenerateTable data={tableData} size='sm' borderRadius='xl' />
					</Box>
				) : (
					<Box
						border='1px'
						borderColor='gray.300'
						w='4xl'
						minH='100%'
						h='2xs'
						rounded='xl'
						p={1}
						alignItems='center'
						justifyContent='center'
					>
						<VStack mx='auto' mt={12}>
							<Image src={EmptyQueryPreviewImage} h='20' />
							<Text fontSize='md' fontWeight='bold'>
								Ready to test your query?
							</Text>
							<Text fontSize='sm'>Run your query to preview the rows</Text>
						</VStack>
					</Box>
				)}
			</VStack>
		</Box>
	);
};

export default DefineSQL;
